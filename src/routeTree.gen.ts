/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AdminImport } from './routes/admin'
import { Route as CustomerImport } from './routes/_customer'
import { Route as AuthImport } from './routes/_auth'
import { Route as AdminIndexImport } from './routes/admin/index'
import { Route as CustomerIndexImport } from './routes/_customer/index'
import { Route as AdminOrdersImport } from './routes/admin/orders'
import { Route as CustomerCartImport } from './routes/_customer/cart'
import { Route as CustomerAccountImport } from './routes/_customer/account'
import { Route as AuthSignupImport } from './routes/_auth/signup'
import { Route as AuthSigninImport } from './routes/_auth/signin'
import { Route as AdminProductAddImport } from './routes/admin/product_/add'
import { Route as CustomerProductProductIdImport } from './routes/_customer/product_.$productId'
import { Route as AdminProductEditProductIdImport } from './routes/admin/product_/edit.$productId'

// Create/Update Routes

const AdminRoute = AdminImport.update({
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const CustomerRoute = CustomerImport.update({
  id: '/_customer',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const AdminIndexRoute = AdminIndexImport.update({
  path: '/',
  getParentRoute: () => AdminRoute,
} as any)

const CustomerIndexRoute = CustomerIndexImport.update({
  path: '/',
  getParentRoute: () => CustomerRoute,
} as any)

const AdminOrdersRoute = AdminOrdersImport.update({
  path: '/orders',
  getParentRoute: () => AdminRoute,
} as any)

const CustomerCartRoute = CustomerCartImport.update({
  path: '/cart',
  getParentRoute: () => CustomerRoute,
} as any)

const CustomerAccountRoute = CustomerAccountImport.update({
  path: '/account',
  getParentRoute: () => CustomerRoute,
} as any)

const AuthSignupRoute = AuthSignupImport.update({
  path: '/signup',
  getParentRoute: () => AuthRoute,
} as any)

const AuthSigninRoute = AuthSigninImport.update({
  path: '/signin',
  getParentRoute: () => AuthRoute,
} as any)

const AdminProductAddRoute = AdminProductAddImport.update({
  path: '/product/add',
  getParentRoute: () => AdminRoute,
} as any)

const CustomerProductProductIdRoute = CustomerProductProductIdImport.update({
  path: '/product/$productId',
  getParentRoute: () => CustomerRoute,
} as any)

const AdminProductEditProductIdRoute = AdminProductEditProductIdImport.update({
  path: '/product/edit/$productId',
  getParentRoute: () => AdminRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/_customer': {
      id: '/_customer'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof CustomerImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/_auth/signin': {
      id: '/_auth/signin'
      path: '/signin'
      fullPath: '/signin'
      preLoaderRoute: typeof AuthSigninImport
      parentRoute: typeof AuthImport
    }
    '/_auth/signup': {
      id: '/_auth/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof AuthSignupImport
      parentRoute: typeof AuthImport
    }
    '/_customer/account': {
      id: '/_customer/account'
      path: '/account'
      fullPath: '/account'
      preLoaderRoute: typeof CustomerAccountImport
      parentRoute: typeof CustomerImport
    }
    '/_customer/cart': {
      id: '/_customer/cart'
      path: '/cart'
      fullPath: '/cart'
      preLoaderRoute: typeof CustomerCartImport
      parentRoute: typeof CustomerImport
    }
    '/admin/orders': {
      id: '/admin/orders'
      path: '/orders'
      fullPath: '/admin/orders'
      preLoaderRoute: typeof AdminOrdersImport
      parentRoute: typeof AdminImport
    }
    '/_customer/': {
      id: '/_customer/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof CustomerIndexImport
      parentRoute: typeof CustomerImport
    }
    '/admin/': {
      id: '/admin/'
      path: '/'
      fullPath: '/admin/'
      preLoaderRoute: typeof AdminIndexImport
      parentRoute: typeof AdminImport
    }
    '/_customer/product/$productId': {
      id: '/_customer/product/$productId'
      path: '/product/$productId'
      fullPath: '/product/$productId'
      preLoaderRoute: typeof CustomerProductProductIdImport
      parentRoute: typeof CustomerImport
    }
    '/admin/product/add': {
      id: '/admin/product/add'
      path: '/product/add'
      fullPath: '/admin/product/add'
      preLoaderRoute: typeof AdminProductAddImport
      parentRoute: typeof AdminImport
    }
    '/admin/product/edit/$productId': {
      id: '/admin/product/edit/$productId'
      path: '/product/edit/$productId'
      fullPath: '/admin/product/edit/$productId'
      preLoaderRoute: typeof AdminProductEditProductIdImport
      parentRoute: typeof AdminImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  AuthRoute: AuthRoute.addChildren({ AuthSigninRoute, AuthSignupRoute }),
  CustomerRoute: CustomerRoute.addChildren({
    CustomerAccountRoute,
    CustomerCartRoute,
    CustomerIndexRoute,
    CustomerProductProductIdRoute,
  }),
  AdminRoute: AdminRoute.addChildren({
    AdminOrdersRoute,
    AdminIndexRoute,
    AdminProductAddRoute,
    AdminProductEditProductIdRoute,
  }),
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_auth",
        "/_customer",
        "/admin"
      ]
    },
    "/_auth": {
      "filePath": "_auth.tsx",
      "children": [
        "/_auth/signin",
        "/_auth/signup"
      ]
    },
    "/_customer": {
      "filePath": "_customer.tsx",
      "children": [
        "/_customer/account",
        "/_customer/cart",
        "/_customer/",
        "/_customer/product/$productId"
      ]
    },
    "/admin": {
      "filePath": "admin.tsx",
      "children": [
        "/admin/orders",
        "/admin/",
        "/admin/product/add",
        "/admin/product/edit/$productId"
      ]
    },
    "/_auth/signin": {
      "filePath": "_auth/signin.tsx",
      "parent": "/_auth"
    },
    "/_auth/signup": {
      "filePath": "_auth/signup.tsx",
      "parent": "/_auth"
    },
    "/_customer/account": {
      "filePath": "_customer/account.tsx",
      "parent": "/_customer"
    },
    "/_customer/cart": {
      "filePath": "_customer/cart.tsx",
      "parent": "/_customer"
    },
    "/admin/orders": {
      "filePath": "admin/orders.tsx",
      "parent": "/admin"
    },
    "/_customer/": {
      "filePath": "_customer/index.tsx",
      "parent": "/_customer"
    },
    "/admin/": {
      "filePath": "admin/index.tsx",
      "parent": "/admin"
    },
    "/_customer/product/$productId": {
      "filePath": "_customer/product_.$productId.tsx",
      "parent": "/_customer"
    },
    "/admin/product/add": {
      "filePath": "admin/product_/add.tsx",
      "parent": "/admin"
    },
    "/admin/product/edit/$productId": {
      "filePath": "admin/product_/edit.$productId.tsx",
      "parent": "/admin"
    }
  }
}
ROUTE_MANIFEST_END */
