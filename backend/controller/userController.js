import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import { createNewUserDir } from "../StorageRequests.js";

export const userRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: "User",
  });

  try {
    // Call storage service to create user directory
    const response = await createNewUserDir(user._id);
    const message = "Registered successfully!";

    // Generate token and send response
    generateToken(user, {message, response}, 201, res);
  } catch (error) {
    // Handle errors from the storage service
    return next(new ErrorHandler(`User registered but directory creation failed! \n error : ${error}`, 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`User Not Found With This Role!`, 400));
  }
  generateToken(user, "Login Successfully!", 201, res);
});


export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout function for frontend user
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("userToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "user Logged Out Successfully.",
    });
});

export const updatePassword = catchAsyncErrors(async(req, res, next) => {
  const {currentPassword, newPassword} = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(currentPassword);
  
  if(!isPasswordMatched){
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  
  sendToken(user, 200, res, "Password updated successfully");
});

export const resetPassword = catchAsyncErrors(async(req, res, next) => {
  const {email, newPassword} = req.body;

  const user = await User.findOne({email, role: 'User'});

  if(!user){
    return next(new ErrorHandler("user with given email doest not exist", 400));
  }

  user.password = newPassword;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password Change successfully',
  })
});
