// Admin Panel JavaScript
let currentPost = null;
let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
let isDirty = false;
let isAuthenticated = false;

// Security Configuration - CHANGE THESE!
const ADMIN_CONFIG = {
    password: 'admin123', // CHANGE THIS PASSWORD!
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000 // 15 minutes
};

let loginAttempts = 0;
let isLocked = false;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
    setupEventListeners();
    setupAutoSave();
    setupSessionTimeout();
});

// Authentication Functions
function checkAuthentication() {
    const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    const now = Date.now();
    
    if (authData.authenticated && authData.expires > now) {
        isAuthenticated = true;
        return true;
    }
    
    // Clear expired session
    localStorage.removeItem('adminAuth');
    return false;
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'none';
    document.getElementById('adminPassword').focus();
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminMain').style.display = 'block';
    loadPosts();
    updateStats();
}

function setupSessionTimeout() {
    setInterval(() => {
        if (isAuthenticated && !checkAuthentication()) {
            logout();
        }
    }, 60000); // Check every minute
}

function logout() {
    isAuthenticated = false;
    localStorage.removeItem('adminAuth');
    showLoginScreen();
    showToast('Session expired. Please login again.', 'info');
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (isLocked) {
        showToast('Account locked. Please try again later.', 'error');
        return;
    }
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_CONFIG.password) {
        // Successful login
        isAuthenticated = true;
        loginAttempts = 0;
        
        // Set session
        const authData = {
            authenticated: true,
            expires: Date.now() + ADMIN_CONFIG.sessionTimeout
        };
        localStorage.setItem('adminAuth', JSON.stringify(authData));
        
        showAdminPanel();
        showToast('Welcome to the admin panel!', 'success');
        
    } else {
        // Failed login
        loginAttempts++;
        
        if (loginAttempts >= ADMIN_CONFIG.maxLoginAttempts) {
            isLocked = true;
            showToast('Too many failed attempts. Account locked for 15 minutes.', 'error');
            setTimeout(() => {
                isLocked = false;
                loginAttempts = 0;
            }, ADMIN_CONFIG.lockoutTime);
        } else {
            showToast(`Invalid password. ${ADMIN_CONFIG.maxLoginAttempts - loginAttempts} attempts remaining.`, 'error');
        }
        
        // Clear password field
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
});

// Event Listeners
function setupEventListeners() {
    // Form inputs
    document.getElementById('postTitle').addEventListener('input', markDirty);
    document.getElementById('postExcerpt').addEventListener('input', markDirty);
    document.getElementById('postContent').addEventListener('input', markDirty);
    document.getElementById('postCategory').addEventListener('change', markDirty);
    document.getElementById('postKeywords').addEventListener('input', markDirty);
    document.getElementById('postImage').addEventListener('input', updateImagePreview);
    document.getElementById('postTags').addEventListener('input', markDirty);
    document.getElementById('postReadTime').addEventListener('input', markDirty);
    document.getElementById('postFilename').addEventListener('input', markDirty);
    document.getElementById('postStatus').addEventListener('change', markDirty);
    document.getElementById('postPriority').addEventListener('change', markDirty);

    // Prevent accidental navigation
    window.addEventListener('beforeunload', function(e) {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Auto-save functionality
function setupAutoSave() {
    setInterval(function() {
        if (isDirty && currentPost) {
            savePostToStorage();
            isDirty = false;
            showToast('Auto-saved', 'info');
        }
    }, 30000); // Auto-save every 30 seconds
}

// Load all posts
function loadPosts() {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    if (posts.length === 0) {
        postList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 1rem;">No posts yet. Create your first post!</p>';
        return;
    }

    posts.forEach((post, index) => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
            <div class="post-item-title">${post.title || 'Untitled'}</div>
            <div class="post-item-meta">${post.status} • ${post.date || 'No date'}</div>
        `;
        postItem.addEventListener('click', () => loadPost(index));
        postList.appendChild(postItem);
    });
}

// Load a specific post
function loadPost(index) {
    currentPost = posts[index];
    isDirty = false;
    
    // Update form fields
    document.getElementById('postTitle').value = currentPost.title || '';
    document.getElementById('postExcerpt').value = currentPost.excerpt || '';
    document.getElementById('postContent').value = currentPost.content || '';
    document.getElementById('postCategory').value = currentPost.category || 'JavaScript';
    document.getElementById('postKeywords').value = currentPost.keywords || '';
    document.getElementById('postImage').value = currentPost.image || '';
    document.getElementById('postTags').value = currentPost.tags || '';
    document.getElementById('postReadTime').value = currentPost.readTime || '5 min read';
    document.getElementById('postFilename').value = currentPost.filename || '';
    document.getElementById('postStatus').value = currentPost.status || 'draft';
    document.getElementById('postPriority').value = currentPost.priority || '0.8';

    // Update image preview
    updateImagePreview();

    // Update active post in list
    document.querySelectorAll('.post-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.post-item')[index].classList.add('active');
}

// Create new post
function createNewPost() {
    if (isDirty && currentPost) {
        if (!confirm('You have unsaved changes. Save before creating new post?')) {
            return;
        }
        savePostToStorage();
    }

    currentPost = {
        id: Date.now(),
        title: '',
        excerpt: '',
        content: '',
        category: 'JavaScript',
        keywords: '',
        image: '',
        tags: '',
        readTime: '5 min read',
        filename: '',
        status: 'draft',
        priority: '0.8',
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        created: new Date().toISOString()
    };

    // Clear form
    document.getElementById('postTitle').value = '';
    document.getElementById('postExcerpt').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postCategory').value = 'JavaScript';
    document.getElementById('postKeywords').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postReadTime').value = '5 min read';
    document.getElementById('postFilename').value = '';
    document.getElementById('postStatus').value = 'draft';
    document.getElementById('postPriority').value = '0.8';

    // Clear image preview
    document.getElementById('imagePreview').innerHTML = '';

    // Clear active post
    document.querySelectorAll('.post-item').forEach(item => item.classList.remove('active'));

    isDirty = false;
    showToast('New post created', 'success');
}

// Save blog post
function saveBlogPost() {
    if (!currentPost) {
        createNewPost();
    }

    // Update current post with form data
    currentPost.title = document.getElementById('postTitle').value;
    currentPost.excerpt = document.getElementById('postExcerpt').value;
    currentPost.content = document.getElementById('postContent').value;
    currentPost.category = document.getElementById('postCategory').value;
    currentPost.keywords = document.getElementById('postKeywords').value;
    currentPost.image = document.getElementById('postImage').value;
    currentPost.tags = document.getElementById('postTags').value;
    currentPost.readTime = document.getElementById('postReadTime').value;
    currentPost.filename = document.getElementById('postFilename').value;
    currentPost.status = document.getElementById('postStatus').value;
    currentPost.priority = document.getElementById('postPriority').value;

    // Generate filename if not provided
    if (!currentPost.filename) {
        currentPost.filename = currentPost.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    // Save to storage
    savePostToStorage();

    // Generate HTML file
    generateHTMLFile();

    // Update homepage if needed
    if (document.getElementById('updateHomepage').checked) {
        updateHomepage();
    }

    // Update sitemap if needed
    if (document.getElementById('updateSitemap').checked) {
        updateSitemap();
    }

    isDirty = false;
    showToast('Post saved successfully!', 'success');
}

// Save post to localStorage
function savePostToStorage() {
    if (!currentPost) return;

    const index = posts.findIndex(p => p.id === currentPost.id);
    if (index >= 0) {
        posts[index] = currentPost;
    } else {
        posts.push(currentPost);
    }

    localStorage.setItem('blogPosts', JSON.stringify(posts));
    loadPosts();
    updateStats();
}

// Generate HTML file
function generateHTMLFile() {
    if (!currentPost) return;

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentPost.title} | CodeCrafter Live</title>
    <meta name="description" content="${currentPost.excerpt}">
    <meta name="keywords" content="${currentPost.keywords}">
    <meta name="author" content="CodeCrafter Live">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${currentPost.title}">
    <meta property="og:description" content="${currentPost.excerpt}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://codecrafter.live/${currentPost.filename}.html">
    <meta property="og:image" content="${currentPost.image}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${currentPost.title}">
    <meta name="twitter:description" content="${currentPost.excerpt}">
    <meta name="twitter:image" content="${currentPost.image}">
    
    <!-- CSS -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="post-styles.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav">
            <div class="nav-container">
                <div class="nav-logo">
                    <a href="/" class="logo-link">
                        <span class="logo-text">CodeCrafter</span>
                        <span class="logo-live">.live</span>
                    </a>
                </div>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="index.html#home" class="nav-link">Home</a>
                    </li>
                    <li class="nav-item">
                        <a href="index.html#blog" class="nav-link">Blog</a>
                    </li>
                    <li class="nav-item">
                        <a href="index.html#tutorials" class="nav-link">Tutorials</a>
                    </li>
                    <li class="nav-item">
                        <a href="index.html#about" class="nav-link">About</a>
                    </li>
                    <li class="nav-item">
                        <a href="index.html#contact" class="nav-link">Contact</a>
                    </li>
                </ul>
                <div class="nav-toggle">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </nav>
    </header>

    <!-- Dark Mode Toggle -->
    <div class="dark-mode-toggle" id="darkModeToggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
    </div>

    <!-- Article Content -->
    <main class="article-main">
        <article class="article">
            <div class="article-header">
                <div class="article-meta">
                    <span class="article-category">${currentPost.category}</span>
                    <span class="article-date">${currentPost.date}</span>
                    <span class="article-read-time">${currentPost.readTime}</span>
                </div>
                <h1 class="article-title">${currentPost.title}</h1>
                <p class="article-excerpt">
                    ${currentPost.excerpt}
                </p>
            </div>

            <!-- Ad Banner (Top of Article) -->
            <div class="ad-container ad-article-top">
                <div class="ad-banner">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-XXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                </div>
            </div>

            <div class="article-content">
                ${formatContent(currentPost.content)}
            </div>
        </article>

        <!-- Sidebar -->
        <aside class="article-sidebar">
            <!-- Ad Banner (Sidebar) -->
            <div class="ad-container ad-sidebar">
                <div class="ad-banner">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-XXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                </div>
            </div>

            <div class="sidebar-section">
                <h3>Related Articles</h3>
                <div class="related-articles">
                    <a href="post-1.html" class="related-article">
                        <h4>Master Modern JavaScript: ES6+ Features Every Developer Should Know</h4>
                        <p>Dive deep into the latest JavaScript features including async/await, destructuring, modules, and more.</p>
                    </a>
                    <a href="post-2.html" class="related-article">
                        <h4>Building Responsive Websites: CSS Grid vs Flexbox</h4>
                        <p>Learn when to use CSS Grid and when to use Flexbox for creating modern, responsive layouts.</p>
                    </a>
                </div>
            </div>

            <div class="sidebar-section">
                <h3>Newsletter</h3>
                <p>Get the latest programming tutorials delivered to your inbox.</p>
                <form class="sidebar-newsletter">
                    <input type="email" placeholder="Your email" required>
                    <button type="submit" class="btn btn-primary">Subscribe</button>
                </form>
            </div>
        </aside>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3 class="footer-title">CodeCrafter Live</h3>
                    <p class="footer-description">
                        Your ultimate destination for programming tutorials, tech insights, and coding resources.
                    </p>
                </div>
                <div class="footer-section">
                    <h4 class="footer-subtitle">Categories</h4>
                    <ul class="footer-links">
                        <li><a href="#">JavaScript</a></li>
                        <li><a href="#">Python</a></li>
                        <li><a href="#">Web Development</a></li>
                        <li><a href="#">Mobile Apps</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-subtitle">Resources</h4>
                    <ul class="footer-links">
                        <li><a href="#">Tutorials</a></li>
                        <li><a href="#">Code Examples</a></li>
                        <li><a href="#">Tools</a></li>
                        <li><a href="#">Cheat Sheets</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-subtitle">Support</h4>
                    <ul class="footer-links">
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 CodeCrafter Live. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="script.js"></script>
    
    <!-- Google AdSense Script -->
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</body>
</html>`;

    // Download the file
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPost.filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Format content for HTML
function formatContent(content) {
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, '');
}

// Update image preview
function updateImagePreview() {
    const imageUrl = document.getElementById('postImage').value;
    const preview = document.getElementById('imagePreview');
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">`;
    } else {
        preview.innerHTML = '';
    }
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Toolbar functions
function insertHeading() {
    insertText('\n\n## Your Heading Here\n\n');
}

function insertSubheading() {
    insertText('\n\n### Your Subheading Here\n\n');
}

function insertCode() {
    insertText('\n\n```\n// Your code here\n```\n\n');
}

function insertList() {
    insertText('\n\n- Item 1\n- Item 2\n- Item 3\n\n');
}

function insertImage() {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
        insertText(`\n\n![Image description](${imageUrl})\n\n`);
    }
}

function insertLink() {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:');
    if (url && text) {
        insertText(`[${text}](${url})`);
    }
}

function insertQuote() {
    insertText('\n\n> This is a quote or important note.\n\n');
}

function insertText(text) {
    const textarea = document.getElementById('postContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    markDirty();
}

// Load template
function loadTemplate(templateType) {
    const templates = {
        tutorial: {
            content: `# Getting Started

Welcome to this comprehensive tutorial! In this guide, you'll learn everything you need to know about [TOPIC].

## Prerequisites

Before we begin, make sure you have:
- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

## Step 1: Setup

Let's start by setting up our environment:

\`\`\`
// Your setup code here
console.log("Hello World!");
\`\`\`

## Step 2: Implementation

Now let's implement the main functionality:

\`\`\`
// Your implementation code here
function main() {
    // Implementation details
}
\`\`\`

## Conclusion

Congratulations! You've successfully completed this tutorial. You now know how to [SUMMARY OF WHAT THEY LEARNED].

## Next Steps

- [Next step 1]
- [Next step 2]
- [Next step 3]`
        },
        news: {
            content: `# Breaking: [NEWS TITLE]

[Brief introduction to the news story]

## What Happened

[Detailed explanation of the event or announcement]

## Impact on Developers

[How this affects the developer community]

## Technical Details

[Technical aspects of the news]

\`\`\`
// Example code if relevant
const example = "code here";
\`\`\`

## Industry Reaction

[Quotes or reactions from industry experts]

## Looking Ahead

[What this means for the future]

## Conclusion

[Summary and final thoughts]`
        },
        review: {
            content: `# [TOOL/SERVICE NAME] Review: [VERDICT]

[Brief introduction and overall rating]

## Overview

[What the tool/service is and what it does]

## Pros

- [Positive point 1]
- [Positive point 2]
- [Positive point 3]

## Cons

- [Negative point 1]
- [Negative point 2]
- [Negative point 3]

## Features

[Detailed breakdown of key features]

## Pricing

[Pricing information and value assessment]

## Performance

[Performance analysis]

\`\`\`
// Example usage if relevant
const example = "code here";
\`\`\`

## Verdict

[Final recommendation and rating]

## Who Should Use It

[Target audience]

## Alternatives

[Other options to consider]`
        },
        opinion: {
            content: `# [OPINION TITLE]

[Opening statement that hooks the reader]

## The Current State

[Analysis of the current situation]

## My Perspective

[Your personal take on the issue]

## Why This Matters

[Why readers should care about this topic]

## The Evidence

[Supporting evidence for your argument]

\`\`\`
// Code examples if relevant
const evidence = "supporting code";
\`\`\`

## Counterarguments

[Addressing potential objections]

## The Future

[What you think will happen next]

## What You Can Do

[Actionable advice for readers]

## Conclusion

[Wrap up your argument with a strong conclusion]`
        }
    };

    if (templates[templateType]) {
        document.getElementById('postContent').value = templates[templateType].content;
        markDirty();
        showToast(`Loaded ${templateType} template`, 'success');
    }
}

// Preview post
function previewPost() {
    if (!currentPost) {
        showToast('No post to preview', 'error');
        return;
    }

    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <div class="article-preview">
            <h1>${currentPost.title || 'Untitled'}</h1>
            <div class="article-meta">
                <span class="category">${currentPost.category}</span>
                <span class="date">${currentPost.date}</span>
                <span class="read-time">${currentPost.readTime}</span>
            </div>
            <div class="content">
                ${formatContent(currentPost.content)}
            </div>
        </div>
    `;

    document.getElementById('previewModal').style.display = 'block';
}

// Close preview
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Publish post
function publishPost() {
    if (!currentPost) {
        showToast('No post to publish', 'error');
        return;
    }

    currentPost.status = 'published';
    document.getElementById('postStatus').value = 'published';
    
    saveBlogPost();
    showToast('Post published!', 'success');
}

// Update stats
function updateStats() {
    const totalPosts = posts.length;
    const draftPosts = posts.filter(p => p.status === 'draft').length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;

    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('draftPosts').textContent = draftPosts;
    document.getElementById('publishedPosts').textContent = publishedPosts;
}

// Mark form as dirty
function markDirty() {
    isDirty = true;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.textContent = '✅';
    } else if (type === 'error') {
        toastIcon.textContent = '❌';
    } else if (type === 'info') {
        toastIcon.textContent = 'ℹ️';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update homepage (placeholder)
function updateHomepage() {
    showToast('Homepage update feature coming soon!', 'info');
}

// Update sitemap (placeholder)
function updateSitemap() {
    showToast('Sitemap update feature coming soon!', 'info');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
});
