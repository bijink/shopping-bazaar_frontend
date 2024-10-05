import { Dialog, DialogBackdrop, DialogPanel, PopoverGroup } from '@headlessui/react';
import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { Link, useLocation } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { twMerge as tm, twMerge } from 'tailwind-merge';
import { CartSideDrawerOpenContext } from '../contexts';
import useLocalUser from '../hooks/useLocalUser';
import { User } from '../types/global.type';
import SignoutConfirmation from './SignoutConfirmation';

const navigation = {
  pages: [
    { name: 'Cart', href: '/cart' },
    { name: 'Orders', href: '/orders' },
  ],
};

const MobileMenuDialog = ({
  open,
  setOpen,
  pathname,
  user,
  setOpenSignoutDialog,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pathname: string;
  user: User | null;
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

        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
          {user?.role === 'admin' ? (
            <div className="flow-root">
              <Link
                to="/admin"
                className="-m-2 block p-2 font-medium text-gray-700"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </div>
          ) : (
            <div className="flow-root">
              <Link
                to="/"
                className="-m-2 block p-2 font-medium text-gray-700"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
            </div>
          )}
          {navigation.pages.map((page) => (
            <div key={page.name} className="flow-root">
              <Link
                key={page.name}
                to={page.href}
                className={twMerge(
                  '-m-2 block p-2 font-medium text-gray-700',
                  user?.role !== 'customer' && 'cursor-default text-gray-200',
                )}
                disabled={user?.role !== 'customer'}
                onClick={() => setOpen(false)}
              >
                {page.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
          {user ? (
            <div className="flow-root">
              <button
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setOpenSignoutDialog(true), setOpen(false);
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="flow-root">
                <Link
                  to="/signin"
                  className={tm(
                    '-m-2 block p-2 font-medium text-gray-700 hover:text-gray-900',
                    pathname === '/signin' && 'cursor-default text-gray-200 hover:text-gray-200',
                  )}
                  disabled={pathname === '/signin'}
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </div>
              <div className="flow-root">
                <Link
                  to="/signup"
                  className={tm(
                    '-m-2 block p-2 font-medium text-gray-700 hover:text-gray-900',
                    pathname === '/signup' && 'cursor-default text-gray-400 hover:text-gray-400',
                  )}
                  disabled={pathname === '/signup'}
                  onClick={() => setOpen(false)}
                >
                  Create account
                </Link>
              </div>
            </>
          )}
        </div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default function Header({ cartCount }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);
  const [openSignoutDialog, setOpenSignoutDialog] = useState(false);

  const { setOpen: cartSideDrawerSetOpen } = useContext(CartSideDrawerOpenContext)!;
  const user = useLocalUser();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  return (
    <>
      {/* Confirmation dialog for signout */}
      <SignoutConfirmation open={openSignoutDialog} setOpen={setOpenSignoutDialog} />

      {/* Mobile menu */}
      <MobileMenuDialog
        open={open}
        setOpen={setOpen}
        pathname={pathname}
        user={user}
        setOpenSignoutDialog={setOpenSignoutDialog}
      />
      <header className="relative">
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
                  {user?.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="flex cursor-pointer items-center text-sm font-medium text-gray-700 hover:text-gray-900 [&.active]:text-indigo-600"
                    >
                      Admin
                    </Link>
                  ) : (
                    <Link
                      to="/"
                      className="flex cursor-pointer items-center text-sm font-medium text-gray-700 hover:text-gray-900 [&.active]:text-indigo-600"
                    >
                      Home
                    </Link>
                  )}
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      to={page.href}
                      className={twMerge(
                        'flex cursor-pointer items-center text-sm font-medium text-gray-700 hover:text-gray-900 [&.active]:text-indigo-600',
                        user?.role !== 'customer' &&
                          'cursor-default text-gray-200 hover:text-gray-200 [&.active]:text-gray-200',
                      )}
                      disabled={user?.role !== 'customer'}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                {user?.role !== 'admin' && (
                  <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                    {user ? (
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
                  {/* <div className="ml-2 flex">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-500 disabled:text-gray-200"
                      disabled={user?.role !== 'customer'}
                    >
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div> */}
                  {/* Cart */}
                  {user?.role !== 'admin' && (
                    <div className="ml-2 flow-root">
                      <button
                        onClick={() => cartSideDrawerSetOpen(true)}
                        className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 disabled:text-gray-200"
                        disabled={user?.role !== 'customer'}
                      >
                        <span className="sr-only">Cart</span>
                        <ShoppingCartIcon aria-hidden="true" className="h-6 w-6 flex-shrink-0" />
                        {user?.role === 'customer' && !!cartCount && (
                          <div className="absolute -end-[0px] top-[3px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white dark:text-black">
                            {cartCount}
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                  {/* Account */}
                  {user?.role === 'customer' && (
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
