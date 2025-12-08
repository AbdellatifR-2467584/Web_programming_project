<head>
    <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ReciPin</title>
            <link rel="icon" type="image/png" href="/resources/logo/Logo_cirkel.png">
                <link rel="stylesheet" href="/css/sidebar.css">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
                    </head>
                    <body>


                        <aside class="sidebar">
                            <a href="/" class="logo-link" aria-label="ReciPin Home">
                                <img class="logo" src="/resources/logo/Logo_cirkel.png" alt="ReciPin Logo">
                            </a>

                            <nav class="sidebar-nav">
                                <a href="/" class="nav-item" aria-label="Home">
                                    <i class="bi bi-house-door-fill"></i>
                                </a>
                                <a href="/Upload" class="nav-item" aria-label="Upload">
                                    <i class="bi bi-upload"></i>
                                </a>
                                <a href="/my-ingredients" class="nav-item" aria-label="Mijn Ingrediënten">
                                    <i class="bi bi-basket-fill"></i>
                                </a>
                                <% if (locals.user) { %>
<a href="/user/<%= user.username %>" class="nav-item mobile-user-link" aria-label="Profiel">
<img src="/resources/profilepictures/default.png" alt="Profiel"
    style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
</a>
<% } %>
                            </nav>
                        </aside>
                    </body>
                    <script src="/js/sidebar.js" defer></script>