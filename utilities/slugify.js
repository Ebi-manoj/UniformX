import slugify from 'slugify';
import { Product } from '../model/product_model.js';

export const generateSlug = async title => {
  let slug = slugify(title, { lower: true, strict: true });
  let uniqueSlug = slug;
  let counter = 1;

  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};
