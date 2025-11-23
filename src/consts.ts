import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'joseiedo',
  description:
    'my brain dump',
  href: 'https://joseiedo.com',
  author: 'iedo',
  locale: 'en-US',
  featuredPostCount: 3,
  postsPerPage: 6,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/joseiedo',
    label: 'GitHub',
  },
  {
    href: 'https://linkedin.com/in/joseiedo',
    label: 'LinkedIn',
  },
  {
    href: 'mailto:joseiedoduarte@outlook.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
