import { Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navigation = [
  { name: '首页', to: '/' },
  { name: '作品集', to: '/gallery' },
  { name: '后台管理', to: '/admin' },
];

export default function Navbar() {
  return (
    <Disclosure as="nav" className="fixed inset-x-0 top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
      {({ open }) => (
        <>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="gradient-frame rounded-full p-[2px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-lg font-display font-semibold text-white">
                  光
                </div>
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="font-display text-lg tracking-wide text-white">光影私语</span>
                <span className="text-xs text-slate-400">Immersive Photo Narratives</span>
              </div>
            </div>
            <div className="hidden items-center space-x-6 md:flex">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'text-sm font-medium transition-colors hover:text-white',
                      isActive ? 'text-white' : 'text-slate-400'
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center">
              <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 md:hidden">
                <span className="sr-only">打开导航</span>
                {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </Disclosure.Button>
            </div>
          </div>
          <Transition
            as={Fragment}
            enter="transition duration-150 ease-out"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition duration-100 ease-in"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.to}
                    as={NavLink}
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-lg px-3 py-2 text-base font-medium',
                        isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'
                      )
                    }
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
