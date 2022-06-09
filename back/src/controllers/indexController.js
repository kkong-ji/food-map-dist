const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");
const indexDao = require("../dao/indexDao");

// 식당 조회
exports.readRestaurants = async function (req, res) {
  const { category } = req.query;

  // 카테고리 값이 넘어 왔다면, 유효한 값인지 체크
  if (category) {
    const validCategory = ["한식","중식","일식","양식","분식","구이","회/초밥","기타"];

  if (!validCategory.includes(category)) {
      return res.send({
        isSuccess: false,
        code: 400, // 요청 실패시 400번대 코드
        message: "유효한 카테고리가 아닙니다.",
      });
    }
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.selectRestaurants(connection, category);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "식당 목록 요청 성공",
      });
    } catch (err) {
      logger.error(`readRestaurants Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`readRestaurants DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

exports.selectRestaurants = async function (connection, category) {
  const selectAllRestaurants = `SELECT title, address, category, videoUrl FROM restaurants where status = 'A';`;
  const selectCategorizedRestaurantsQuery = `SELECT title, address, category, videoUrl FROM restaurants where status = 'A' and category = ?;`;

  const Params = [category];

  const Query = category ? selectCategorizedRestaurantsQuery : selectAllRestaurants;

  const rows = await connection.query(Query, Params);

  return rows;
}


// 예시 코드
exports.example = async function (req, res) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.exampleDao(connection);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "요청 성공",
      });
    } catch (err) {
      logger.error(`example Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`example DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};
