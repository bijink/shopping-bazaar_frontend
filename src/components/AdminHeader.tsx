import { Dialog, DialogBackdrop, DialogPanel, PopoverGroup } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import SignoutConfirmation from './SignoutConfirmation';

const MobileMenuDialog = ({
  open,
  setOpen,
  setOpenSignoutDialog,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSignoutDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
    />

    <div className="fixed inset-0 z-40 flex">
      <DialogPanel
        transition
        className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full dark:bg-gray-900"
      >
        <div className="flex px-4 pb-2 pt-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 dark:text-gray-100"
          >
            <span className="absolute -inset-0.5" />
            <span className="sr-only">Close menu</span>
            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 border-t border-gray-200 px-4 py-6 dark:border-gray-600">
          <div className="flow-root">
            <Link
              to="/admin"
              className="-m-2 block p-2 font-medium text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          </div>
          <div className="flow-root">
            <Link
              to="/admin/orders"
              className="-m-2 block p-2 font-medium text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
              onClick={() => setOpen(false)}
            >
              All orders
            </Link>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-200 px-4 py-6 dark:border-gray-600">
          <div className="flow-root">
            <button
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-300"
              onClick={() => {
                setOpenSignoutDialog(true), setOpen(false);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [openSignoutDialog, setOpenSignoutDialog] = useState(false);

  return (
    <>
      {/* Confirmation dialog for signout */}
      <SignoutConfirmation open={openSignoutDialog} setOpen={setOpenSignoutDialog} />

      {/* Mobile menu */}
      <MobileMenuDialog open={open} setOpen={setOpen} setOpenSignoutDialog={setOpenSignoutDialog} />
      <header className="relative">
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 dark:border-gray-600">
            <div className="flex h-16 items-center">
              {/* Hamburger menu button */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden dark:bg-gray-700 dark:text-gray-100"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="logo ml-4 flex lg:ml-0">
                <div className="flex space-x-1">
                  <Link to="/">
                    <ShoppingBagIcon className="h-8 w-8 flex-shrink-0 text-indigo-600 group-hover:text-gray-500" />
                    <span className="sr-only">Shopping Bazaar - Admin</span>
                  </Link>
                  <Link to="/admin">
                    <p className="pt-2 font-bold">Admin</p>
                  </Link>
                </div>
              </div>

              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  <Link
                    to="/admin/orders"
                    className="flex cursor-pointer items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-300 [&.active]:text-indigo-600 dark:[&.active]:text-indigo-500"
                  >
                    All orders
                  </Link>
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  <button
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-300"
                    onClick={() => setOpenSignoutDialog(true)}
                  >
                    Sign out
                  </button>
                </div>
                <div className="ml-auto flex items-center lg:ml-4">
                  {/* Search */}
                  {/* <div className="ml-2 flex">
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
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
