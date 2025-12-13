// public/js/sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('closeSidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileToggle = document.getElementById('mobileSidebarToggle');

    function openSidebar() {
        if (window.innerWidth > 768) {
            // Desktop behavior
            sidebar.classList.add('expanded');
            if (mainContent) {
                mainContent.style.marginLeft = '250px';
            }
        } else {
            // Mobile behavior - overlay
            sidebar.classList.add('expanded');
        }
    }

    function closeSidebar() {
        sidebar.classList.remove('expanded');
        if (mainContent && window.innerWidth > 768) {
            mainContent.style.marginLeft = '60px';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (sidebar.classList.contains('expanded')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            if (sidebar.classList.contains('expanded')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isToggleButton = event.target.closest('#mobileSidebarToggle');
            
            if (!isClickInsideSidebar && !isToggleButton && sidebar.classList.contains('expanded')) {
                closeSidebar();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (sidebar.classList.contains('expanded')) {
                if (mainContent) {
                    mainContent.style.marginLeft = '250px';
                }
            } else {
                if (mainContent) {
                    mainContent.style.marginLeft = '60px';
                }
            }
        } else {
            if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
        }
    });

    // Set active navigation item based on current path
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove active class from all links first
        link.classList.remove('active');
        
        // Exact match for specific routes
        if (currentPath === href) {
            link.classList.add('active');
        }
        // Special handling for map route - only match exact /map path
        else if (href === '/map' && currentPath === '/map') {
            link.classList.add('active');
        }
        // For directory, match /directory but NOT /map
        else if (href === '/directory' && currentPath.startsWith('/directory') && !currentPath.startsWith('/map')) {
            link.classList.add('active');
        }
        // For other routes, check if current path starts with the link href
        else if (href !== '/' && href !== '/map' && href !== '/directory' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });
});
