import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        // generate access and refresh token 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // refreshToken saved in database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend {using postman}
  const { fullName, email, username, password } = req.body;
//   console.log("email:", email);
//   console.log("FILES RECEIVED:", req.files);
//   console.log("AVATAR PATH:", req.files?.avatar?.[0]?.path);


  /*
    if(fullName == ""){
        throw new ApiError(400, "fullname is required")
    }
  */
  // validation - NOT EMPTY
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists : username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
//   const coverImagePath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  // check for images, and avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Error while registering the User");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const {email, username, password} = req.body
    
    // username or email based login
    if(!username || !email){
        throw new ApiError(400, "Username or password is required")
    }

    // find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not Exist!")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    // send cookie
    const options  = {
        httpOnly: true,
        secure: true
    }

    // return response -> Successfully
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        { 
            // update -> delete the refreshToken
            $set: {
                refreshToken: undefined
            }
        }, 
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options) // method -> clearCookie()
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser
} 
