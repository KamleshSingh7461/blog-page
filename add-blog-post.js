#!/usr/bin/env node

/**
 * Blog Post Creator Script
 * Automatically creates new blog posts and updates the homepage
 * 
 * Usage: node add-blog-post.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to create blog post
async function createBlogPost() {
    console.log('🚀 Welcome to the CodeCrafter Live Blog Post Creator!\n');
    
    try {
        // Get blog post details
        const title = await askQuestion('📝 Enter blog post title: ');
        const description = await askQuestion('📄 Enter blog post description: ');
        const keywords = await askQuestion('🔍 Enter keywords (comma-separated): ');
        const category = await askQuestion('📂 Enter category: ');
        const filename = await askQuestion('📁 Enter filename (without .html): ');
        const imageUrl = await askQuestion('🖼️ Enter featured image URL: ');
        const readTime = await askQuestion('⏱️ Enter estimated read time (e.g., "5 min read"): ');
        const tags = await askQuestion('🏷️ Enter tags (comma-separated): ');
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Read template
        const template = fs.readFileSync('blog-template.html', 'utf8');
        
        // Replace placeholders
        let newPost = template
            .replace(/YOUR_BLOG_TITLE/g, title)
            .replace(/YOUR_BLOG_DESCRIPTION/g, description)
            .replace(/YOUR_KEYWORDS/g, keywords)
            .replace(/YOUR_BLOG_FILENAME/g, filename)
            .replace(/YOUR_IMAGE_URL/g, imageUrl)
            .replace(/YOUR_CATEGORY/g, category)
            .replace(/YOUR_DATE/g, currentDate)
            .replace(/X min read/g, readTime)
            .replace(/YOUR_TAG_1/g, tags.split(',')[0]?.trim() || '')
            .replace(/YOUR_TAG_2/g, tags.split(',')[1]?.trim() || '')
            .replace(/YOUR_TAG_3/g, tags.split(',')[2]?.trim() || '');
        
        // Create the new blog post file
        const filenameWithExt = `${filename}.html`;
        fs.writeFileSync(filenameWithExt, newPost);
        console.log(`✅ Created ${filenameWithExt}`);
        
        // Update homepage
        await updateHomepage(title, description, category, filenameWithExt, imageUrl, currentDate, readTime);
        
        // Update sitemap
        await updateSitemap(filenameWithExt, currentDate);
        
        console.log('\n🎉 Blog post created successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Edit the content in your new blog post file');
        console.log('2. Test the website locally');
        console.log('3. Deploy to your hosting');
        console.log('4. Share on social media!');
        
    } catch (error) {
        console.error('❌ Error creating blog post:', error.message);
    } finally {
        rl.close();
    }
}

// Function to update homepage
async function updateHomepage(title, description, category, filename, imageUrl, date, readTime) {
    try {
        let homepage = fs.readFileSync('index.html', 'utf8');
        
        // Create new post card HTML
        const newPostCard = `
                <article class="post-card">
                    <div class="post-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy">
                        <div class="post-category">${category}</div>
                    </div>
                    <div class="post-content">
                        <h3 class="post-title">
                            <a href="${filename}">${title}</a>
                        </h3>
                        <p class="post-excerpt">
                            ${description}
                        </p>
                        <div class="post-meta">
                            <span class="post-date">${date}</span>
                            <span class="post-read-time">${readTime}</span>
                        </div>
                    </div>
                </article>`;
        
        // Find the posts grid and add the new post
        const postsGridRegex = /(<div class="posts-grid">[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<article class="post-card">[\s\S]*?<\/article>[\s\S]*?<\/div>)/;
        
        if (postsGridRegex.test(homepage)) {
            homepage = homepage.replace(postsGridRegex, `$1${newPostCard}`);
        } else {
            // Fallback: add after the last post card
            const lastPostCardRegex = /(<article class="post-card">[\s\S]*?<\/article>)(\s*<\/div>)/;
            homepage = homepage.replace(lastPostCardRegex, `$1${newPostCard}$2`);
        }
        
        fs.writeFileSync('index.html', homepage);
        console.log('✅ Updated homepage');
        
    } catch (error) {
        console.error('❌ Error updating homepage:', error.message);
    }
}

// Function to update sitemap
async function updateSitemap(filename, date) {
    try {
        let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
        
        // Create new URL entry
        const newUrl = `    <url>
        <loc>https://codecrafter.live/${filename}</loc>
        <lastmod>${date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
        
        // Add before closing </urlset> tag
        sitemap = sitemap.replace('</urlset>', newUrl);
        
        fs.writeFileSync('sitemap.xml', sitemap);
        console.log('✅ Updated sitemap');
        
    } catch (error) {
        console.error('❌ Error updating sitemap:', error.message);
    }
}

// Run the script
createBlogPost();
