import { useBreadcrumbItems } from '#imports'
// @vitest-environment nuxt
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { useRouterMock } = vi.hoisted(() => {
  return {
    useRouterMock: vi.fn().mockImplementation(() => {
      return {
        resolve: vi.fn().mockImplementation((s: string) => {
          if (s === '/') {
            return { matched: [{ name: 'index', title: 'Home' }] }
          }
          return { matched: [{ name: 'unknown' }] }
        }),
        currentRoute: {
          value: {
            path: '/',
          },
        },
      }
    }),
  }
})

mockNuxtImport('useRouter', () => {
  return useRouterMock
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('useBreadcrumbItems', () => {
  it('home', async () => {
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
    [
      {
        "ariaLabel": "Home",
        "current": true,
        "label": "Home",
        "to": "/",
      },
    ]
  `)
  })
  it('subpath', async () => {
    // change the path
    useRouterMock.mockImplementation(() => {
      return {
        currentRoute: {
          value: {
            path: '/subpath',
          },
        },
        resolve(s: string) {
          if (s === '/subpath') {
            return { matched: [{ name: 'subpath', title: 'My subpath' }] }
          }
          return { matched: [{ name: 'index' }] }
        },
      }
    })
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
      [
        {
          "ariaLabel": "Home",
          "current": false,
          "label": "Home",
          "to": "/",
        },
        {
          "ariaLabel": "Subpath",
          "current": true,
          "label": "Subpath",
          "to": "/subpath",
        },
      ]
    `)
  })
  it('catch-all', async () => {
    // change the path
    useRouterMock.mockImplementation(() => {
      return {
        currentRoute: {
          value: {
            path: '/docs/seo-utils/getting-started/installation',
          },
        },
        resolve(s: string) {
          if (s !== '/') {
            return {
              matched: [
                {
                  name: 'docs-slug',
                  path: '/docs/:slug(.*)*',
                },
              ],
            }
          }
          return { matched: [{ name: 'index' }] }
        },
      }
    })
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
      [
        {
          "ariaLabel": "Home",
          "current": false,
          "label": "Home",
          "to": "/",
        },
        {
          "ariaLabel": "Docs",
          "current": false,
          "label": "Docs",
          "to": "/docs",
        },
        {
          "ariaLabel": "Seo Utils",
          "current": false,
          "label": "Seo Utils",
          "to": "/docs/seo-utils",
        },
        {
          "ariaLabel": "Getting Started",
          "current": false,
          "label": "Getting Started",
          "to": "/docs/seo-utils/getting-started",
        },
        {
          "ariaLabel": "Installation",
          "current": true,
          "label": "Installation",
          "to": "/docs/seo-utils/getting-started/installation",
        },
      ]
    `)
  })

  it('catch-all #2', async () => {
    // change the path
    useRouterMock.mockImplementation(() => {
      return {
        currentRoute: {
          value: {
            name: 'docs-slug',
            path: '/docs/seo-utils/getting-started/installation',
          },
        },
        resolve() {
          return null
        },
      }
    })
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
      [
        {
          "ariaLabel": "",
          "current": false,
          "label": "",
          "to": "/",
        },
        {
          "ariaLabel": "Docs",
          "current": false,
          "label": "Docs",
          "to": "/docs",
        },
        {
          "ariaLabel": "Seo Utils",
          "current": false,
          "label": "Seo Utils",
          "to": "/docs/seo-utils",
        },
        {
          "ariaLabel": "Getting Started",
          "current": false,
          "label": "Getting Started",
          "to": "/docs/seo-utils/getting-started",
        },
        {
          "ariaLabel": "Installation",
          "current": true,
          "label": "Installation",
          "to": "/docs/seo-utils/getting-started/installation",
        },
      ]
    `)
  })
})
