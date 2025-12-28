const pool = require("../config/db");

// ✅ GET /admin/giftcode
exports.index = async (req, res) => {
  try {
    const [giftcodes] = await pool.execute("SELECT * FROM giftcode ORDER BY id DESC");

    // ✅ gom tất cả itemId + optionId để query 1 lần
    const allItemIds = new Set();
    const allOptionIds = new Set();

    giftcodes.forEach(gc => {
      try {
        const items = JSON.parse(gc.listItem || "[]");
        items.forEach(it => allItemIds.add(Number(it.id)));

        const opts = JSON.parse(gc.itemoption || "[]");
        opts.forEach(op => allOptionIds.add(Number(op.id)));
      } catch (e) {
        console.log("JSON parse error giftcode id:", gc.id);
      }
    });

    // ✅ query lấy tên item
    const itemMap = {};
    if (allItemIds.size > 0) {
      const ids = [...allItemIds];
      const [rows] = await pool.query(
        `SELECT id, name FROM item_template WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
      rows.forEach(r => (itemMap[r.id] = r.name));
    }

    // ✅ query lấy tên option
    const optionMap = {};
    if (allOptionIds.size > 0) {
      const ids = [...allOptionIds];
      const [rows] = await pool.query(
        `SELECT id, name FROM item_option_template WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
      rows.forEach(r => (optionMap[r.id] = r.name));
    }

    // ✅ build rewardText
    const result = giftcodes.map(gc => {
      let rewardText = "";

      try {
        const items = JSON.parse(gc.listItem || "[]");
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


// ✅ GET /admin/giftcode/create
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


// ✅ POST /admin/giftcode/create
exports.store = async (req, res) => {
  try {
    // tạm thời test
    res.send("OK - store giftcode");
  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};
