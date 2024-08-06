import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  // ma hoa password cho vao database
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({
      ...req.body,
      password: hash,

    });

    await newUser.save();
    res.status(200).send("User has been created.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "Sai tên đăng nhập hoặc mật khẩu"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Sai tên đăng nhập hoặc mật khẩu"));

    // tao 1 JSON Web Token gui den cookie, chua truong id va isAdmin KHI LOGIN
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );
    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
      })
    // httpOnly: true, // de bao mat hon , ko duoc truy cap cookie qua javascript
    //  res.cookie("user_id", user._id.toString(), {
    //   });

    res.status(200).json({ ...otherDetails, isAdmin }); // cái trả về sẽ dùng ở Login.jsx- phần dispatch(kq trả về đẩy vào payload/ cũng là trong localStorage)
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  // Xóa cookie "access_token"
  res.clearCookie("access_token");

  // Trả về mã trạng thái 200 (OK) hoặc bất kỳ phản hồi nào bạn muốn trả về
  res.status(200).send("Logged out successfully");
}

export const changePassword = async (req, res,next) => {
  // tim user theo id tu token trong cookie
  const user = await User.findById(req.user.id)
  if (!user) return next(createError(404, "User not found!"));
  const isOldPasswordCorrect = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  if (!isOldPasswordCorrect)
    return next(createError(400, "Mật khẩu cũ ko đúng!"));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.newPassword, salt);
    const modifyUser = await User.findByIdAndUpdate(
      req.user.id,
      { password: hash,},
      { new: true }
    )

    res.status(200).json({
      message:"Change password successfully",
      newUser:modifyUser
    });
}

// nếu qua đc middleware thì là có token
export const checkHasToken = (req, res, next) => {
  // check time expire token
  const token = req.cookies.access_token;
  jwt.verify(token, process.env.JWT, (err, decoded) => {

    // Nếu giải mã thành công, kiểm tra thời hạn của token
    const currentTimestamp = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính bằng giây
    const issuedAtTimestamp = decoded.iat;
    const tokenAgeInSeconds = currentTimestamp - issuedAtTimestamp;
    const tokenAgeInDays = Math.floor(tokenAgeInSeconds / (24 * 60 * 60));
    if (tokenAgeInDays > 5) { // hạn tổng là 7
      // Nếu token đã tồn tại quá 5 ngày
      return next(createError(401, "Token has been alive for more than 5 day"));
    } else {
      // Nếu token còn hạn, tiếp tục xử lý
      res.status(200).json("Token còn hạn hơn 2 ngày");
    }
  
  });
}

export const checkHasAccessTokenAdministrator = (req, res) => {

  res.status(200).send("Có access Token administrator");
}