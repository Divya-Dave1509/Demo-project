// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initMegaMenu();
    initVideoFallback();
    initSmoothScrolling();
    initAccessibility();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function() {
            // Toggle mobile menu
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle aria-expanded for accessibility
            const isExpanded = navMenu.classList.contains('active');
            mobileMenu.setAttribute('aria-expanded', isExpanded);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenu.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // Close mobile menu on window resize if screen becomes larger
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
}

// Close mobile menu helper function
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        // Close any open dropdowns
        const activeDropdowns = document.querySelectorAll('.dropdown.active');
        activeDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
}

// Mega Menu Functionality
function initMegaMenu() {
    const dropdownItems = document.querySelectorAll('.dropdown');
    
    dropdownItems.forEach(dropdown => {
        const navLink = dropdown.querySelector('.nav-link');
        const megaMenu = dropdown.querySelector('.mega-menu');
        
        if (navLink && megaMenu) {
            // Desktop hover functionality
            if (window.innerWidth > 768) {
                dropdown.addEventListener('mouseenter', function() {
                    // Close other open menus
                    closeAllMegaMenus();
                    dropdown.classList.add('active');
                });
                
                dropdown.addEventListener('mouseleave', function() {
                    dropdown.classList.remove('active');
                });
            }
            
            // Mobile click functionality
            navLink.addEventListener('click', function(event) {
                if (window.innerWidth <= 768) {
                    event.preventDefault();
                    
                    const isActive = dropdown.classList.contains('active');
                    
                    // Close all other dropdowns
                    closeAllMegaMenus();
                    
                    // Toggle current dropdown
                    if (!isActive) {
                        dropdown.classList.add('active');
                        navLink.setAttribute('aria-expanded', 'true');
                    } else {
                        dropdown.classList.remove('active');
                        navLink.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Keyboard navigation support
            navLink.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    if (window.innerWidth <= 768) {
                        event.preventDefault();
                        navLink.click();
                    }
                }
                
                if (event.key === 'Escape') {
                    dropdown.classList.remove('active');
                    navLink.setAttribute('aria-expanded', 'false');
                    navLink.focus();
                }
            });
        }
    });
    
    // Handle window resize for mega menu behavior
    window.addEventListener('resize', function() {
        closeAllMegaMenus();
        
        // Reset aria-expanded attributes on resize
        const navLinks = document.querySelectorAll('.dropdown .nav-link');
        navLinks.forEach(link => {
            link.setAttribute('aria-expanded', 'false');
        });
    });
}

// Close all mega menus helper function
function closeAllMegaMenus() {
    const activeDropdowns = document.querySelectorAll('.dropdown.active');
    activeDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        const navLink = dropdown.querySelector('.nav-link');
        if (navLink) {
            navLink.setAttribute('aria-expanded', 'false');
        }
    });
}

// Video Fallback and Loading
function initVideoFallback() {
    const video = document.querySelector('.banner-video');
    const videoContainer = document.querySelector('.video-container');
    
    if (video && videoContainer) {
        // Show loader initially
        videoContainer.classList.add('loading');
        
        // Handle video loading states
        video.addEventListener('loadstart', function() {
            videoContainer.classList.add('loading');
        });
        
        video.addEventListener('canplay', function() {
            videoContainer.classList.remove('loading');
            // Try to play the video with user interaction fallback
            playVideoWithFallback(video);
        });
        
        video.addEventListener('loadeddata', function() {
            videoContainer.classList.remove('loading');
            playVideoWithFallback(video);
        });
        
        // Handle video error - provide fallback
        video.addEventListener('error', function() {
            console.warn('Video failed to load, using fallback background');
            videoContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            video.style.display = 'none';
            videoContainer.classList.remove('loading');
        });
        
        // Remove loader after a timeout as fallback
        setTimeout(() => {
            videoContainer.classList.remove('loading');
        }, 5000);
        
        // Pause video when not in viewport (performance optimization)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    playVideoWithFallback(video);
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(video);
    }
}

// Helper function to handle video playback with autoplay restrictions
function playVideoWithFallback(video) {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Video started playing successfully
            console.log('Video is playing');
        }).catch(error => {
            // Autoplay was prevented
            console.log('Video autoplay prevented, adding click-to-play functionality');
            addClickToPlay(video);
        });
    }
}

// Add click-to-play functionality when autoplay is prevented
function addClickToPlay(video) {
    const videoContainer = video.closest('.video-container');
    const overlay = videoContainer.querySelector('.video-overlay');
    
    if (overlay && !overlay.querySelector('.play-button')) {
        // Create play button
        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        playButton.innerHTML = '▶ Click to Play Video';
        playButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(52, 152, 219, 0.9);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            z-index: 10;
        `;
        
        playButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(52, 152, 219, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        playButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(52, 152, 219, 0.9)';
            this.style.transform = 'scale(1)';
        });
        
        playButton.addEventListener('click', function() {
            video.play().then(() => {
                this.style.display = 'none';
            }).catch(e => {
                console.error('Failed to play video:', e);
            });
        });
        
        overlay.appendChild(playButton);
    }
}

// Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                event.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                event.preventDefault();
                
                // Close mobile menu if open
                closeMobileMenu();
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Accessibility Enhancements
function initAccessibility() {
    // Add ARIA labels and roles
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenu.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('role', 'button');
        mobileMenu.setAttribute('tabindex', '0');
        
        navMenu.setAttribute('role', 'navigation');
        navMenu.setAttribute('aria-label', 'Main navigation');
    }
    
    // Add ARIA labels to dropdown links
    const dropdownLinks = document.querySelectorAll('.dropdown .nav-link');
    dropdownLinks.forEach(link => {
        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');
    });
    
    // Add keyboard navigation for mobile menu toggle
    if (mobileMenu) {
        mobileMenu.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
    }
    
    // Focus management for mega menus
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Close all menus on Escape
            closeAllMegaMenus();
            closeMobileMenu();
        }
    });
    
    // Skip to main content link (for screen readers)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 1001;
        border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add id to main content for skip link
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
    }
}

// Utility function to debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized resize handler
const handleResize = debounce(() => {
    // Re-initialize functionality that depends on screen size
    const dropdownItems = document.querySelectorAll('.dropdown');
    
    dropdownItems.forEach(dropdown => {
        const navLink = dropdown.querySelector('.nav-link');
        if (navLink) {
            navLink.setAttribute('aria-expanded', 'false');
        }
        dropdown.classList.remove('active');
    });
}, 250);

window.addEventListener('resize', handleResize);

// Performance optimization: Lazy load images if any are added later
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
initLazyLoading();

// Add loading states and error handling for dynamic content
function showLoading(element) {
    element.classList.add('loading');
    element.setAttribute('aria-busy', 'true');
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.setAttribute('aria-busy', 'false');
}

// Export functions for potential external use
window.MegaMenuUtils = {
    closeMobileMenu,
    closeAllMegaMenus,
    showLoading,
    hideLoading
};