#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Get the title from command line arguments
const title = process.argv.slice(2).join(' ')

if (!title) {
  console.error('Error: Please provide a title for the blog post')
  console.error('Usage: npm run new-post "Your Post Title"')
  process.exit(1)
}

// Generate slug from title (lowercase, replace spaces and special chars with hyphens)
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

// Get current date in YYYY-MM-DD format
const today = new Date()
const dateString = today.toISOString().split('T')[0]

// Create the blog post frontmatter
const frontmatter = `---
title: ${title}
description: ""
date: ${dateString}
tags: []
image: ''
draft: false
authors:
    - iedo
---

Write your content here...
`

// Define the file path
const blogDir = join(process.cwd(), 'src', 'content', 'blog')
const filePath = join(blogDir, `${slug}.md`)

// Check if file already exists
if (existsSync(filePath)) {
  console.error(`Error: Blog post already exists at ${filePath}`)
  process.exit(1)
}

// Ensure the blog directory exists
if (!existsSync(blogDir)) {
  mkdirSync(blogDir, { recursive: true })
}

// Write the file
try {
  writeFileSync(filePath, frontmatter, 'utf-8')
  console.log(`✅ Blog post created successfully!`)
  console.log(`📝 File: ${filePath}`)
  console.log(`🔗 Slug: ${slug}`)
  console.log(`\nYou can now edit the file and add your content.`)
} catch (error) {
  console.error(`Error creating blog post: ${error.message}`)
  process.exit(1)
}
