const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return data.rows;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

/* ***************************
 *  Get a single inventory item by id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`;
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("getInventoryById error:", err);
    throw err;
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING classification_id
    `;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (err) {
    console.error("addClassification error:", err);
    return null;
  }
}

/* ***************************
 *  Add a new vehicle / inventory item
 * ************************** */
async function addInventory(vehicleData) {
  try {
    const sql = `
      INSERT INTO public.inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
         inv_price, inv_miles, inv_color, classification_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id
    `;

    const values = [
      vehicleData.inv_make,
      vehicleData.inv_model,
      vehicleData.inv_year,
      vehicleData.inv_description,
      vehicleData.inv_image,
      vehicleData.inv_thumbnail,
      vehicleData.inv_price,
      vehicleData.inv_miles,
      vehicleData.inv_color,
      vehicleData.classification_id,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (err) {
    console.error("addInventory error:", err);
    return null;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return 0;
  }
}

async function getCommentsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        c.comment_id,
        c.comment_text,
        c.created_at,
        a.account_id,
        a.account_firstname,
        a.account_lastname
      FROM comment c
      JOIN account a
        ON c.account_id = a.account_id
      WHERE c.inv_id = $1
      ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function insertComment(inv_id, account_id, comment_text) {
  try {
    const sql = `
      INSERT INTO comment (inv_id, account_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    return await pool.query(sql, [inv_id, account_id, comment_text]);
  } catch (error) {
    console.error("insertComment error:", error);
    throw error;
  }
}

async function getCommentById(comment_id) {
  try {
    const sql = `SELECT * FROM comment WHERE comment_id = $1`;
    const result = await pool.query(sql, [comment_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getCommentById error:", error);
    throw error;
  }
}

async function deleteComment(comment_id) {
  try {
    const sql = `DELETE FROM comment WHERE comment_id = $1`;
    return await pool.query(sql, [comment_id]);
  } catch (error) {
    console.error("deleteComment error:", error);
    throw error;
  }
}

async function getSingleComment(comment_id) {
  try {
    const sql = `
      SELECT 
        c.comment_id,
        c.inv_id,
        c.account_id,
        c.comment_text,
        c.created_at,
        a.account_firstname,
        i.inv_year,
        i.inv_make,
        i.inv_model
      FROM public.comment AS c
      JOIN public.account AS a
        ON c.account_id = a.account_id
      JOIN public.inventory AS i
        ON c.inv_id = i.inv_id
      WHERE c.comment_id = $1
    `;

    const result = await pool.query(sql, [comment_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("getSingleComment error:", error);
    throw error;
  }
}

async function updateComment(comment_id, comment_text) {
  const sql = `
    UPDATE comment
    SET comment_text = $1
    WHERE comment_id = $2
    RETURNING *
  `;
  const result = await pool.query(sql, [comment_text, comment_id]);
  return result.rows[0];
}
module.exports = {
  getClassifications,
  deleteInventoryItem,
  getInventoryByClassificationId,
  getInventoryById,
  updateInventory,
  addClassification,
  addInventory,
  insertComment,
  getCommentById,
  deleteComment,
  getCommentsByInventoryId,
  getCommentById,
  getSingleComment,
  updateComment,
};
