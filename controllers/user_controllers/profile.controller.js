import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import Address from '../../model/address.js';
import { validateId } from '../../utilities/validateId.js';
import { cloudinary } from '../../config/cloudinary.js';
const userMain = './layouts/user_main';

////////////////////////
//Fetch Profile
export const fetchDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  const addresses = await Address.find({ userId: user._id });
  const defaultAddress = addresses.find(addr => addr.is_default === true);

  res.render('user/profile', {
    layout: userMain,
    js_file: 'profile',
    user,
    addresses,
    defaultAddress,
  });
});

////////////////////////////////////////////////
///Edit profile

export const editProfile = asyncHandler(async (req, res) => {
  const { full_name, email, phone, addressId } = req.body;
  if (!full_name || !email || !phone) {
    req.flash('error', 'All fields are required!');
    return res.redirect('/profile');
  }
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('error', 'Session expired!');
    res.redirect('/profile');
  }
  const user = await User.findById(userId);
  user.full_name = full_name;
  user.email = email;
  user.phone = phone;
  user.save();

  // update address
  if (addressId) {
    if (!validateId(addressId)) {
      req.flash('error', 'Invalid address ID!');
      return res.redirect('/profile');
    }
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      req.flash('error', 'Address not found!');
      return res.redirect('/profile');
    }
    await Address.updateMany({ userId }, { $set: { is_default: false } });

    address.is_default = true;
    await address.save();
  }
  req.flash('success', 'Profile updated successfully');
  res.redirect('/profile');
});

/////////////////////////////////////////
//Upload Profile Pic

export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      req.flash('error', 'No image found!');
      return res.redirect('/profile');
    }
    const userId = req.user?._id;
    if (!validateId(userId)) {
      req.flash('error', 'Session expired');
      return res.redirect('/profile');
    }

    const user = await User.findById(userId);
    if (user?.image) {
      const publicId = user.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`uniformx/profiles/${publicId}`);
    }
    user.image = req.file.path;
    await user.save();
    req.flash('success', 'Profile image updated');
    return res.redirect('/profile');
  } catch (error) {
    next(error);
  }
});
/////////////////////////////////////////////
//Change Password

// Get Route for Password
export const getChangePassword = asyncHandler(async (req, res) => {
  res.render('user/change_password', { layout: userMain });
});

//Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword, confirmpassword } = req.body;
  if (!oldpassword || !newpassword || !confirmpassword) {
    req.flash('error', 'All fields are required');
    return res.redirect('/profile/password');
  }
  if (newpassword !== confirmpassword) {
    req.flash('error', 'Password are not matching');
    return res.redirect('/profile/password');
  }
  const id = req.user?._id;
  if (!validateId(id)) {
    req.flash('error', 'Session expired');
    return res.redirect('/profile/password');
  }
  const user = await User.findById(id);
  const isMatch = user.comparePassword(oldpassword);
  if (!isMatch) {
    req.flash('error', 'Incorrect password');
    return res.redirect('/profile/password');
  }
  user.password = newpassword;
  await user.save();
  req.flash('success', 'Password changed succefully');
  res.redirect('/profile/password');
});
////////////////////////////////////////
//Fetch Address
export const fetchAddress = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const addresses = await Address.find({ userId: id }).sort({
    createdAt: -1,
  });
  res.render('user/address', {
    js_file: 'profile',
    layout: userMain,
    addresses,
  });
});
//////////////////////////////////
/// addAddress
export const addAddress = asyncHandler(async (req, res) => {
  const { fullName, mobile, address, district, state, country, pincode } =
    req.body;
  if (
    !fullName ||
    !mobile ||
    !address ||
    !district ||
    !state ||
    !country ||
    !pincode
  ) {
    req.flash('error', 'Fields are empty');
    return res.redirect('/profile/address');
  }

  if (!req.user || !req.user._id) {
    req.flash('error', 'Session expired!');
    return res.redirect('/profile/address');
  }
  const newAddress = new Address({
    name: fullName,
    userId: req.user._id,
    mobile,
    street_address: address,
    district,
    state,
    country,
    pincode,
  });
  await newAddress.save();
  req.flash('success', 'Address added successfully!');
  res.redirect('/profile/address');
});

////////////////////////////////////
//Edit Address

export const editAddress = asyncHandler(async (req, res) => {
  const { id, fullName, mobile, address, district, state, country, pincode } =
    req.body;

  // Validate input
  if (
    !id ||
    !fullName ||
    !mobile ||
    !address ||
    !district ||
    !state ||
    !country ||
    !pincode
  ) {
    req.flash('error', 'All Field required!');
    return res.redirect('/profile/address');
  }

  if (!req.user || !req.user._id) {
    req.flash('error', 'Session expired!');
    return res.redirect('/profile/address');
  }
  const existingAddress = await Address.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!existingAddress) {
    req.flash('error', 'Address not found!');
    return res.redirect('/profile/address');
  }

  // Update address fields
  existingAddress.name = fullName;
  existingAddress.mobile = mobile;
  existingAddress.street_address = address;
  existingAddress.district = district;
  existingAddress.state = state;
  existingAddress.country = country;
  existingAddress.pincode = pincode;

  await existingAddress.save();
  req.flash('success', 'Address Updated');
  res.redirect('/profile/address');
});

//////////////////////////////////////////////////////////
///////Delete Address

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    res.status(404).json({ success: false, message: 'Invalid address!' });
    return;
  }
  const address = await Address.findByIdAndDelete(id);
  if (!address) {
    return res
      .status(404)
      .json({ success: false, message: 'something went wrong' });
  }
  res
    .status(200)
    .json({ success: true, message: 'Address deleted successfully' });
});
