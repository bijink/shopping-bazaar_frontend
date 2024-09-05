'use client';

import { Radio, RadioGroup } from '@headlessui/react';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalUser from '../hooks/useLocalUser';
import { Base64Image, ProductWithBase64Image } from '../types/global.type';
import stringOps from '../utils/stringOps';
import ProductDeleteConfirmation from './ProductDeleteConfirmation';

const product = {
  name: 'Basic Tee 6-Pack',
  price: '$192',
  href: '#',
  breadcrumbs: [
    { id: 1, name: 'Men', href: '#' },
    { id: 2, name: 'Clothing', href: '#' },
  ],
  images: [
    {
      src: 'https://tailwindui.com/img/ecommerce-images/product-page-02-secondary-product-shot.jpg',
      alt: 'Two each of gray, white, and black shirts laying flat.',
    },
    {
      src: 'https://tailwindui.com/img/ecommerce-images/product-page-02-tertiary-product-shot-01.jpg',
      alt: 'Model wearing plain black basic tee.',
    },
    {
      src: 'https://tailwindui.com/img/ecommerce-images/product-page-02-tertiary-product-shot-02.jpg',
      alt: 'Model wearing plain gray basic tee.',
    },
    {
      src: 'https://tailwindui.com/img/ecommerce-images/product-page-02-featured-product-shot.jpg',
      alt: 'Model wearing plain white basic tee.',
    },
  ],
  colors: [
    { name: 'White', class: 'bg-white', selectedClass: 'ring-gray-400' },
    { name: 'Gray', class: 'bg-gray-200', selectedClass: 'ring-gray-400' },
    { name: 'Black', class: 'bg-gray-900', selectedClass: 'ring-gray-900' },
  ],
  sizes: [
    { name: 'XXS', inStock: false },
    { name: 'XS', inStock: true },
    { name: 'S', inStock: true },
    { name: 'M', inStock: true },
    { name: 'L', inStock: true },
    { name: 'XL', inStock: true },
    { name: '2XL', inStock: true },
    { name: '3XL', inStock: true },
  ],
  description:
    'The Basic Tee 6-Pack allows you to fully express your vibrant personality with three grayscale options. Feeling adventurous? Put on a heather gray tee. Want to be a trendsetter? Try our exclusive colorway: "Black". Need to add an extra pop of color to your outfit? Our white tee has you covered.',
  highlights: [
    'Hand cut and sewn locally',
    'Dyed with our proprietary colors',
    'Pre-washed & pre-shrunk',
    'Ultra-soft 100% cotton',
  ],
  details:
    'The 6-Pack includes two black, two white, and two heather gray Basic Tees. Sign up for our subscription service and be the first to get new, exciting colors, like our upcoming "Charcoal Gray" limited release.',
};
// const reviews = { href: '#', average: 4, totalCount: 117 };

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function DisplayImageUI({
  index,
  image,
  height,
}: {
  index: number;
  image: Base64Image;
  height: number;
}) {
  return (
    <div className="aspect-h-4 aspect-w-3 overflow-hidden rounded-lg">
      {image ? (
        <img
          src={`data:image/${image.mimeType};base64,${image.data}`}
          alt={`product-image-${index + 1}`}
          className={twMerge(
            'w-full rounded-lg border border-black border-opacity-10 object-cover object-center',
            `h-[${height}rem]`,
          )}
        />
      ) : (
        <div
          role="status"
          className={twMerge(
            'flex h-[15rem] max-w-sm items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-700',
            `h-[${height}rem]`,
          )}
        >
          <PhotoIcon className="h-10 w-10 text-gray-200 dark:text-gray-600" />
        </div>
      )}
    </div>
  );
}

export default function ProductOverview({ product2 }: { product2: ProductWithBase64Image }) {
  const user = useLocalUser();
  // console.log({ user, product2 });

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2]);

  const [openProductDeleteDialog, setOpenProductDeleteDialog] = useState(false);

  return (
    <div className="bg-white">
      {/* Confirmation dialog for deleting product */}
      <ProductDeleteConfirmation
        open={openProductDeleteDialog}
        setOpen={setOpenProductDeleteDialog}
        productId={product2._id!}
      />
      <div className="pt-4">
        <div className="flex flex-col justify-between sm:flex-row">
          <nav aria-label="Breadcrumb">
            <ol
              role="list"
              className="mx-auto flex max-w-2xl flex-wrap items-center space-x-2 px-0 sm:px-6 lg:max-w-7xl lg:px-8"
            >
              <li>
                <div className="flex items-center">
                  <span className="font-light text-gray-500">&#10098;</span>
                  {product2.suitableFor.map((item, i) => (
                    <div key={i}>
                      <a href={'#'} className="mr-2 text-sm font-medium text-gray-900">
                        {stringOps.capitalizeFirstWord(item)}
                      </a>
                      {i !== product2.suitableFor.length - 1 && (
                        <span className="-ml-2 mr-2">&#44;</span>
                      )}
                    </div>
                  ))}
                  <span className="-ml-2 font-light text-gray-500">&#10099;</span>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <a href={'#'} className="mr-2 text-sm font-medium text-gray-900">
                    {stringOps.capitalizeFirstWord(product2.category)}
                  </a>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li className="text-sm">
                <a aria-current="page" className="font-medium text-gray-500">
                  {stringOps.capitalizeFirstWord(product2.name)}
                </a>
              </li>
            </ol>
          </nav>
          {user?.role === 'admin' && (
            <div className="flex justify-end sm:px-6 lg:px-8">
              <div className="space-x-4">
                <Link
                  to="/admin/product/edit/$productId"
                  params={{ productId: product2._id as string }}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setOpenProductDeleteDialog(true)}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image gallery */}
        {product2.images.length && (
          <div className="mx-auto mt-6 h-[32rem] max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
            <div className="">
              <DisplayImageUI index={0} image={product2.images[0]} height={32} />
            </div>
            <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
              <DisplayImageUI index={1} image={product2.images[1]} height={15} />
              <DisplayImageUI index={2} image={product2.images[2]} height={15} />
            </div>
            <div className="hidden lg:block">
              <DisplayImageUI index={3} image={product2.images[3]} height={32} />
            </div>
          </div>
        )}

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {stringOps.capitalizeFirstWord(product2.name)}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              <span>&#8377;</span>
              {product2.price}
            </p>

            <form className="mt-10">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Color</h3>

                <fieldset aria-label="Choose a color" className="mt-4">
                  <RadioGroup
                    value={selectedColor}
                    onChange={setSelectedColor}
                    className="flex items-center space-x-3"
                  >
                    {product2.colors.map((color) => (
                      <Radio
                        key={color.name}
                        value={color}
                        aria-label={color.name}
                        className="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 ring-gray-400 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1"
                      >
                        <span
                          aria-hidden="true"
                          className="h-8 w-8 rounded-full border border-black border-opacity-10"
                          style={{ backgroundColor: color.hex }}
                          data-twe-toggle="tooltip"
                          title={stringOps.capitalizeFirstWord(color.name)}
                        />
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              {/* Sizes */}
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  {/* <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Size guide
                  </a> */}
                </div>

                <fieldset aria-label="Choose a size" className="mt-4">
                  <RadioGroup
                    value={selectedSize}
                    onChange={setSelectedSize}
                    className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4"
                  >
                    {Object.entries(product2.sizes).map(([name, inStock]) => (
                      <Radio
                        key={name}
                        value={name} //!:
                        disabled={!inStock}
                        className={classNames(
                          inStock
                            ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                            : 'cursor-not-allowed bg-gray-50 text-gray-200',
                          'group relative flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-indigo-500 sm:flex-1 sm:py-6',
                        )}
                      >
                        <span>{name}</span>
                        {inStock ? (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                          >
                            <svg
                              stroke="currentColor"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                            >
                              <line
                                x1={0}
                                x2={100}
                                y1={100}
                                y2={0}
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          </span>
                        )}
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <button
                type="submit"
                className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add to cart
              </button>
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            {/* Description and details */}
            <div>
              <h3 className="sr-only">Description</h3>

              <div className="space-y-6">
                <p className="text-base text-gray-900">{product2.description}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                  {product2.highlights.map((highlight) => (
                    <li key={highlight} className="text-gray-400">
                      <span className="text-gray-600">
                        {stringOps.capitalizeFirstWord(highlight)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Details</h2>

              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">{product2.details}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
