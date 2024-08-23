'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { Link, useLocation } from '@tanstack/react-router';
import { Fragment, useContext, useState } from 'react';
import { twMerge as tm } from 'tailwind-merge';
import { CartSideDrawerOpenContext } from '../contexts';
import useLocalUser from '../hooks/useLocalUser';
import SignoutConfirmation from './SignoutConfirmation';

const navigation = {
  categories: [
    {
      id: 'women',
      name: 'Women',
      featured: [
        {
          name: 'New Arrivals',
          href: '#',
          imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-01.jpg',
          imageAlt: 'Models sitting back to back, wearing Basic Tee in black and bone.',
        },
        {
          name: 'Basic Tees',
          href: '#',
          imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-02.jpg',
          imageAlt:
            'Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Tops', href: '#' },
            { name: 'Dresses', href: '#' },
            { name: 'Pants', href: '#' },
            { name: 'Denim', href: '#' },
            { name: 'Sweaters', href: '#' },
            { name: 'T-Shirts', href: '#' },
            { name: 'Jackets', href: '#' },
            { name: 'Activewear', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '#' },
            { name: 'Wallets', href: '#' },
            { name: 'Bags', href: '#' },
            { name: 'Sunglasses', href: '#' },
            { name: 'Hats', href: '#' },
            { name: 'Belts', href: '#' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Full Nelson', href: '#' },
            { name: 'My Way', href: '#' },
            { name: 'Re-Arranged', href: '#' },
            { name: 'Counterfeit', href: '#' },
            { name: 'Significant Other', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'men',
      name: 'Men',
      featured: [
        {
          name: 'New Arrivals',
          href: '#',
          imageSrc:
            'https://tailwindui.com/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg',
          imageAlt: 'Drawstring top with elastic loop closure and textured interior padding.',
        },
        {
          name: 'Artwork Tees',
          href: '#',
          imageSrc:
            'https://tailwindui.com/img/ecommerce-images/category-page-02-image-card-06.jpg',
          imageAlt:
            'Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Tops', href: '#' },
            { name: 'Pants', href: '#' },
            { name: 'Sweaters', href: '#' },
            { name: 'T-Shirts', href: '#' },
            { name: 'Jackets', href: '#' },
            { name: 'Activewear', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '#' },
            { name: 'Wallets', href: '#' },
            { name: 'Bags', href: '#' },
            { name: 'Sunglasses', href: '#' },
            { name: 'Hats', href: '#' },
            { name: 'Belts', href: '#' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Re-Arranged', href: '#' },
            { name: 'Counterfeit', href: '#' },
            { name: 'Full Nelson', href: '#' },
            { name: 'My Way', href: '#' },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'Company', href: '#' },
    { name: 'Stores', href: '#' },
  ],
};

const MobileMenuDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
    />

    <div className="fixed inset-0 z-40 flex">
      <DialogPanel
        transition
        className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full"
      >
        <div className="flex px-4 pb-2 pt-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
          >
            <span className="absolute -inset-0.5" />
            <span className="sr-only">Close menu</span>
            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Links */}
        <TabGroup className="mt-2">
          <div className="border-b border-gray-200">
            <TabList className="-mb-px flex space-x-8 px-4">
              {navigation.categories.map((category) => (
                <Tab
                  key={category.name}
                  className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600"
                >
                  {category.name}
                </Tab>
              ))}
            </TabList>
          </div>
          <TabPanels as={Fragment}>
            {navigation.categories.map((category) => (
              <TabPanel key={category.name} className="space-y-10 px-4 pb-8 pt-10">
                <div className="grid grid-cols-2 gap-x-4">
                  {category.featured.map((item) => (
                    <div key={item.name} className="group relative text-sm">
                      <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                        <img
                          alt={item.imageAlt}
                          src={item.imageSrc}
                          className="object-cover object-center"
                        />
                      </div>
                      <a href={item.href} className="mt-6 block font-medium text-gray-900">
                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                        {item.name}
                      </a>
                      <p aria-hidden="true" className="mt-1">
                        Shop now
                      </p>
                    </div>
                  ))}
                </div>
                {category.sections.map((section) => (
                  <div key={section.name}>
                    <p
                      id={`${category.id}-${section.id}-heading-mobile`}
                      className="font-medium text-gray-900"
                    >
                      {section.name}
                    </p>
                    <ul
                      role="list"
                      aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                      className="mt-6 flex flex-col space-y-6"
                    >
                      {section.items.map((item) => (
                        <li key={item.name} className="flow-root">
                          <a href={item.href} className="-m-2 block p-2 text-gray-500">
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>

        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
          {navigation.pages.map((page) => (
            <div key={page.name} className="flow-root">
              <a href={page.href} className="-m-2 block p-2 font-medium text-gray-900">
                {page.name}
              </a>
            </div>
          ))}
        </div>

        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
          <div className="flow-root">
            <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
              Sign in
            </a>
          </div>
          <div className="flow-root">
            <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
              Create account
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-6">
          <a href="#" className="-m-2 flex items-center p-2">
            <img
              alt=""
              src="https://tailwindui.com/img/flags/flag-canada.svg"
              className="block h-auto w-5 flex-shrink-0"
            />
            <span className="ml-3 block text-base font-medium text-gray-900">CAD</span>
            <span className="sr-only">, change currency</span>
          </a>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default function Header({
  noSearch,
  noCart,
  noAccount,
}: {
  noSearch?: boolean;
  noAdminKey?: boolean;
  noCart?: boolean;
  noAccount?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [openSignoutDialog, setOpenSignoutDialog] = useState(false);

  const { setOpen: cartSideDrawerSetOpen } = useContext(CartSideDrawerOpenContext)!;
  const localUser = useLocalUser();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  return (
    <>
      {/* Confirmation dialog for signout */}
      <SignoutConfirmation open={openSignoutDialog} setOpen={setOpenSignoutDialog} />

      {/* Mobile menu */}
      <MobileMenuDialog open={open} setOpen={setOpen} />
      <header className="relative bg-white">
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="logo ml-4 flex lg:ml-0">
                <Link to="/">
                  <span className="sr-only">Shopping Bazaar</span>
                  <ShoppingBagIcon className="h-8 w-8 flex-shrink-0 text-indigo-600 group-hover:text-gray-500" />
                </Link>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-[open]:border-indigo-600 data-[open]:text-indigo-600">
                          {category.name}
                        </PopoverButton>
                      </div>

                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                      >
                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 top-1/2 bg-white shadow"
                        />

                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.featured.map((item) => (
                                  <div
                                    key={item.name}
                                    className="group relative text-base sm:text-sm"
                                  >
                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                      <img
                                        alt={item.imageAlt}
                                        src={item.imageSrc}
                                        className="object-cover object-center"
                                      />
                                    </div>
                                    <a
                                      href={item.href}
                                      className="mt-6 block font-medium text-gray-900"
                                    >
                                      <span aria-hidden="true" className="absolute inset-0 z-10" />
                                      {item.name}
                                    </a>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                {category.sections.map((section) => (
                                  <div key={section.name}>
                                    <p
                                      id={`${section.name}-heading`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <a href={item.href} className="hover:text-gray-800">
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}

                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      to={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 [&.active]:border-indigo-600 [&.active]:text-indigo-600"
                      // className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-[open]:border-indigo-600 data-[open]:text-indigo-600"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                {localUser?.role !== 'admin' && (
                  <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                    {localUser ? (
                      <button
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        onClick={() => setOpenSignoutDialog(true)}
                      >
                        Sign out
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/signin"
                          className={tm(
                            'text-sm font-medium text-gray-700 hover:text-gray-900',
                            pathname === '/signin' &&
                              'cursor-default text-gray-200 hover:text-gray-200',
                          )}
                          disabled={pathname === '/signin'}
                        >
                          Sign in
                        </Link>
                        <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                        <Link
                          to="/signup"
                          className={tm(
                            'text-sm font-medium text-gray-700 hover:text-gray-900',
                            pathname === '/signup' &&
                              'cursor-default text-gray-200 hover:text-gray-200',
                          )}
                          disabled={pathname === '/signup'}
                        >
                          Create account
                        </Link>
                      </>
                    )}
                  </div>
                )}

                <div className="ml-auto flex items-center lg:ml-4">
                  {/* Search */}
                  <div className="ml-2 flex">
                    <button
                      className={tm(
                        'p-2 text-gray-400 hover:text-gray-500',
                        noSearch && 'text-gray-200 hover:text-gray-200',
                      )}
                      disabled={noSearch}
                    >
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div>
                  {/* Button for navigating to admin/seller section */}
                  {/* <div className="ml-2 flex">
                    <Link
                      to="/admin"
                      className={tm(
                        'p-2 text-gray-400 hover:text-gray-500',
                        noAdminKey && 'text-gray-200 hover:text-gray-200',
                      )}
                      disabled={noAdminKey}
                    >
                      <span className="sr-only">Admin</span>
                      <BuildingStorefrontIcon aria-hidden="true" className="h-6 w-6" />
                    </Link>
                  </div> */}
                  {/* Cart */}
                  {localUser?.role !== 'admin' && (
                    <div className="ml-2 flow-root">
                      <button
                        onClick={() => cartSideDrawerSetOpen(true)}
                        className={tm(
                          'relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500',
                          noCart && 'text-gray-200 hover:text-gray-200',
                        )}
                        disabled={noCart}
                      >
                        <span className="sr-only">Cart</span>
                        <ShoppingCartIcon aria-hidden="true" className="h-6 w-6 flex-shrink-0" />
                        {!noCart && (
                          <div className="absolute -end-[0px] top-[3px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white dark:text-black">
                            20
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                  {/* Account */}
                  {!noAccount && localUser?.role === 'customer' && (
                    <div className="ml-2 flow-root">
                      <Link
                        to="/account"
                        className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">User Account</span>
                        <UserCircleIcon aria-hidden="true" className="h-6 w-6 flex-shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
