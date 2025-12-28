const pool = require("../config/db");

exports.searchItems = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    let sql = "";
    let params = [];

    if (!isNaN(q)) {
      sql = `
        SELECT id, name 
        FROM item_template
        WHERE id = ? OR name LIKE ?
        LIMIT 20
      `;
      params = [Number(q), `%${q}%`];
    } else {
      sql = `
        SELECT id, name 
        FROM item_template
        WHERE name LIKE ?
        ORDER BY id ASC
        LIMIT 20
      `;
      params = [`%${q}%`];
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.searchOptions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    let sql = "";
    let params = [];

    if (!isNaN(q)) {
      sql = `
        SELECT id, name 
        FROM item_option_template
        WHERE id = ? OR name LIKE ?
        LIMIT 20
      `;
      params = [Number(q), `%${q}%`];
    } else {
      sql = `
        SELECT id, name 
        FROM item_option_template
        WHERE name LIKE ?
        ORDER BY id ASC
        LIMIT 20
      `;
      params = [`%${q}%`];
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
