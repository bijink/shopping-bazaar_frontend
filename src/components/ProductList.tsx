import { useContext } from 'react';
import { ProductQuickviewOpenContext } from '../contexts';
import { Link } from '@tanstack/react-router';

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/
const products = [
  {
    id: 1,
    name: 'Earthen Bottle',
    href: '#',
    price: '$48',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-01.jpg',
    imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
  },
  {
    id: 2,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
  },
  {
    id: 3,
    name: 'Focus Paper Refill',
    href: '#',
    price: '$89',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 4,
    name: 'Machined Mechanical Pencil',
    href: '#',
    price: '$35',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
  },
  {
    id: 5,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
  },
  {
    id: 6,
    name: 'Focus Paper Refill',
    href: '#',
    price: '$89',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 7,
    name: 'Machined Mechanical Pencil',
    href: '#',
    price: '$35',
    description: 'something',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
  },
  // {
  //   id: 8,
  //   name: 'Earthen Bottle',
  //   href: '#',
  //   price: '$48',
  //   description: 'something',
  //   imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-01.jpg',
  //   imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
  // },
  // More products...
];

export default function ProductList() {
  const { setOpen } = useContext(ProductQuickviewOpenContext)!;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
                <div className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 relative w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(true);
                    }}
                    className="absolute bottom-0 left-0 mb-[5%] ml-[10%] w-[80%] rounded-md bg-white bg-opacity-75 px-4 py-2 text-sm text-gray-800 opacity-0 group-hover:opacity-100"
                  >
                    Quick View
                  </button>
                </div>
                <div className="mt-4 sm:hidden">
                  <h3 className="text-sm text-gray-700">{product.name}</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
                </div>
                <div className="mt-4 hidden justify-between sm:flex">
                  <div>
                    <h3 className="text-sm text-gray-700">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
