const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    )
    return data.rows
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
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
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 *  Get a single inventory item by id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0] || null
  } catch (err) {
    console.error("getInventoryById error:", err)
    throw err
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
    `
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (err) {
    console.error("addClassification error:", err)
    return null
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
    `

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
    ]

    const result = await pool.query(sql, values)
    return result.rows[0]
  } catch (err) {
    console.error("addInventory error:", err)
    return null
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
}
