import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import Address from '../../model/address.js';
import { validateId } from '../../utilities/validateId.js';
const userMain = './layouts/user_main';

////////////////////////
//Fetch Profile
export const fetchDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  const addresses = await Address.find({ userId: user._id });
  const defaultAddress = addresses.find(addr => addr.is_default === true);
  console.log(addresses);
  console.log(defaultAddress);

  res.render('user/profile', {
    layout: userMain,
    js_file: 'profile',
    user,
    addresses,
    defaultAddress,
  });
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
  console.log(req.body);
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
  console.log(req.body);

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
