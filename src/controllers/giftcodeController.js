const pool = require("../config/db");

exports.index = async (req, res) => {
  try {
    const [giftcodes] = await pool.execute("SELECT * FROM giftcode ORDER BY id DESC");
    console.log("✅ DEBUG giftcodes[0]:", giftcodes[0]);

    const allItemIds = new Set();
    const allOptionIds = new Set();

    giftcodes.forEach(gc => {
  try {
    console.log("✅ DEBUG raw listItem (id=" + gc.id + "):", gc.listItem);

    const items = JSON.parse(gc.listItem || "[]");
    console.log("✅ DEBUG parsed items:", items);

    items.forEach(it => allItemIds.add(Number(it.id)));

    const opts = JSON.parse(gc.itemoption || "[]");
    opts.forEach(op => allOptionIds.add(Number(op.id)));
  } catch (e) {
    console.log("❌ JSON parse error giftcode id:", gc.id, e.message);
  }
});

    const itemMap = {};
    if (allItemIds.size > 0) {
      const ids = [...allItemIds];
      const [rows] = await pool.query(
        `SELECT id, name FROM item_template WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
      rows.forEach(r => (itemMap[r.id] = r.name));
    }

    const optionMap = {};
    if (allOptionIds.size > 0) {
      const ids = [...allOptionIds];
      const [rows] = await pool.query(
        `SELECT id, name FROM item_option_template WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
      rows.forEach(r => (optionMap[r.id] = r.name));
    }

    const result = giftcodes.map(gc => {
      let rewardText = "";

      try {
            console.log("✅ DEBUG build rewardText => id:", gc.id, "raw listItem:", gc.listItem);

        const items = JSON.parse(gc.listItem || "[]");
            console.log("✅ DEBUG build items parsed:", items);

        const opts = JSON.parse(gc.itemoption || "[]");

        if (items.length > 0) {
          rewardText += items.map(it => {
            const name = itemMap[it.id] || ("Item #" + it.id);
            return `🎁 <b>${name}</b> (ID:${it.id}) x<b>${it.quantity}</b>`;
          }).join("<br>");
        } else {
          rewardText += `<i style="color:gray;">(Không có vật phẩm)</i>`;
        }

        if (opts.length > 0) {
          rewardText += `<hr style="margin:8px 0">`;
          rewardText += `<b style="color:#d84315;">🔹 Option:</b><br>`;
          rewardText += opts.map(op => {
            const name = optionMap[op.id] || ("Option #" + op.id);
            return `⚡ <b>${name}</b> (ID:${op.id}) : <b>${op.param}</b>`;
          }).join("<br>");
        }
      } catch (e) {
        rewardText = `<span style="color:red;">Không đọc được dữ liệu</span>`;
      }

      return { ...gc, rewardText };
    });

    res.render("admin/giftcode/index", { giftcodes: result });

  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};

exports.create = async (req, res) => {
  try {
    res.render("admin/giftcode/create", {
      msg: null
    });
  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};

exports.store = async (req, res) => {
  try {
    console.log("BODY POST:", req.body);

    const { code, limit, expired, items, options } = req.body;

    // ✅ validate tối thiểu
    if (!code || !limit || !expired) {
      return res.send("Thiếu dữ liệu: code/limit/expired");
    }

    const listItem = items && items !== "" ? items : "[]";
    const itemoption = options && options !== "" ? options : "[]";

    const [result] = await pool.execute(`
      INSERT INTO giftcode
        (code, type, \`delete\`, \`limit\`, listUser, listItem, bagCount, itemoption, create_date, expired)
      VALUES
        (?, 1, 1, ?, '[]', ?, 1, ?, NOW(), ?)
    `, [code, Number(limit), listItem, itemoption, expired]);

    console.log("INSERT RESULT:", result);

    // ✅ nếu insert thành công sẽ có insertId
    if (result.affectedRows > 0) {
      return res.redirect("/admin/giftcode");
    } else {
      return res.send("Insert thất bại - affectedRows=0");
    }

  } catch (err) {
    console.error("STORE GIFTCODE ERROR:", err);
    return res.send("Lỗi khi tạo giftcode: " + err.message);
  }
};
