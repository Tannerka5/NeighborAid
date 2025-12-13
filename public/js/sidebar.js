// public/js/sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');

    function openSidebar() {
        if (window.innerWidth > 768) {
            // Desktop behavior - remove collapsed class
            sidebar.classList.remove('collapsed');
            if (mainContent) {
                mainContent.style.marginLeft = '260px';
            }
        } else {
            // Mobile behavior - add open class for overlay
            sidebar.classList.add('open');
            if (overlay) {
                overlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebar() {
        if (window.innerWidth > 768) {
            // Desktop behavior - add collapsed class
            sidebar.classList.add('collapsed');
            if (mainContent) {
                mainContent.style.marginLeft = '70px';
            }
        } else {
            // Mobile behavior - remove open class
            sidebar.classList.remove('open');
            if (overlay) {
                overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }

    // Desktop toggle button
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (sidebar.classList.contains('collapsed')) {
                openSidebar();
            } else {
                closeSidebar();
            }
        });
    }

    // Mobile menu button
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // Close sidebar when clicking overlay (mobile)
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeSidebar();
        });
    }

    // Close sidebar when clicking a nav link on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Initialize sidebar state on page load
    if (window.innerWidth > 768) {
        // Desktop: start collapsed
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.style.marginLeft = '70px';
        }
    } else {
        // Mobile: ensure it's closed
        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('active');
        }
        if (mainContent) {
            mainContent.style.marginLeft = '0';
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                // Desktop mode
                sidebar.classList.remove('open');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                document.body.style.overflow = '';
                
                const isCollapsed = sidebar.classList.contains('collapsed');
                if (mainContent) {
                    if (isCollapsed) {
                        mainContent.style.marginLeft = '70px';
                    } else {
                        mainContent.style.marginLeft = '260px';
                    }
                }
            } else {
                // Mobile mode
                sidebar.classList.remove('collapsed');
                if (mainContent) {
                    mainContent.style.marginLeft = '0';
                }
            }
        }, 100);
    });

    // Set active navigation item based on current path
    const currentPath = window.location.pathname;
    const navItems2 = document.querySelectorAll('.nav-item');
    
    navItems2.forEach(item => {
        const href = item.getAttribute('href');
        
        // Remove active class from all links first
        item.classList.remove('active');
        
        // Exact match for specific routes
        if (currentPath === href) {
            item.classList.add('active');
        }
        // Special handling for map route - only match exact /directory/map path
        else if (href === '/directory/map' && currentPath === '/directory/map') {
            item.classList.add('active');
        }
        // For directory, match /directory but NOT /directory/map
        else if (href === '/directory' && currentPath.startsWith('/directory') && currentPath !== '/directory/map') {
            item.classList.add('active');
        }
        // For other routes, check if current path starts with the link href
        else if (href !== '/' && href !== '/directory/map' && href !== '/directory' && currentPath.startsWith(href)) {
            item.classList.add('active');
        }
    });
});
