
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const queryInput = document.getElementById('query');
    const resultsList = document.getElementById('search-results');
    const favoritesList = document.getElementById('favorites');
    const searchButton = document.getElementById('search-button');
    const favoritesButton = document.getElementById('favorites-button');
    const searchTab = document.getElementById('search-tab');
    const favoritesTab = document.getElementById('favorites-tab');

    searchForm.addEventListener('submit', function(event)
    {
        event.preventDefault();
        fetchAndDisplayAlbums(queryInput.value.trim());
    });

    searchButton.addEventListener('click', activateSearchTab);
    favoritesButton.addEventListener('click', activateFavoritesTab);

    // Initialize page
    activateSearchTab();
    fetchAndDisplayAlbums();

    function activateSearchTab() 
    {
        searchButton.classList.add('active');
        favoritesButton.classList.remove('active');
        searchTab.classList.remove('d-none');
        favoritesTab.classList.add('d-none');
    }

    function activateFavoritesTab() 
    {
        searchButton.classList.remove('active');
        favoritesButton.classList.add('active');
        searchTab.classList.add('d-none');
        favoritesTab.classList.remove('d-none');
        fetchFavorites();
    }

    async function fetchAlbums() 
    {
        try 
        {
            const response = await fetch('https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/albums');
            if (!response.ok) 
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } 
        catch (error) 
        {
            console.error("Failed to fetch albums:", error);
            resultsList.innerHTML = '<li class="list-group-item">Failed to load data. Please try again later.</li>';
        }
    }

    async function fetchFavorites() 
    {
        try 
        {
            const response = await fetch('https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/favorites');
            if (!response.ok) 
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const favorites = await response.json();
            console.log('Fetched favorites:', favorites);
            displayAlbums(favorites, favoritesList, true);
        } 
        catch (error) 
        {
            console.error("Failed to fetch favorites:", error);
        }
    }

    async function fetchAndDisplayAlbums(query) 
    {
        const albums = await fetchAlbums();
        if (!albums) return;
        const filteredAlbums = query ? albums.filter(album =>
            album.artistName.toLowerCase().includes(query.toLowerCase()) ||
            album.albumName.toLowerCase().includes(query.toLowerCase())
        ) : albums;
        displayAlbums(filteredAlbums, resultsList, false);
    }

    function displayAlbums(albums, listElement, isFavorite) 
    {
        listElement.innerHTML = '';
        if (albums.length === 0) 
        {
            listElement.innerHTML = '<li class="list-group-item">No albums found.</li>';
            return;
        }
        albums.forEach(album => 
        {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${album.albumName} <span class="badge bg-primary rounded-pill">${album.averageRating}</span></div>
                    ${album.artistName}
                </div>
                <button type="button" class="btn btn-${isFavorite ? 'danger' : 'success'}">${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>
            `;
            const btn = listItem.querySelector('button');
            btn.addEventListener('click', () => 
            {
                if (isFavorite) 
                {
                    removeFromFavorites(album);
                } 
                else 
                {
                    addToFavorites(album);
                }
            });
            listElement.appendChild(listItem);
        });
    }

    async function addToFavorites(album) 
    {
        try 
        {
            console.log(`Checking if album with UID ${album.uid} is already a favorite.`);
            const response = await fetch('https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/favorites');
            const currentFavorites = await response.json();

            if (currentFavorites.some(fav => fav.uid === album.uid)) 
            {
                console.log(`Album with UID ${album.uid} is already a favorite. Not adding.`);
                displayMessage('Album already in favorites', 'warning');
                return; 
            }

            console.log(`Adding new album with UID ${album.uid} to favorites.`);
            const addResponse = await fetch('https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(album)
            });

            if (addResponse.ok) 
            {
                const addedAlbum = await addResponse.json();
                console.log('Album added to favorites:', addedAlbum);
                displayMessage('Album successfully added to favorites', 'success');
                fetchFavorites();
            } 
            else 
            {
                throw new Error(`Failed to add album, status: ${addResponse.status}`);
            }
        } 
        catch (error) 
        {
            console.error('Error in adding to favorites:', error);
        }
    }



    async function removeFromFavorites(album) 
    {
        const response = await fetch('https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/favorites');
        const currentFavorites = await response.json();
        const albumToDelete = currentFavorites.find(fav => fav.id === album.id);
        if (albumToDelete) 
        {
            fetch(`https://661c4d0fe7b95ad7fa6a1bf6.mockapi.io/api/config/favorites/${albumToDelete.id}`, {
                method: 'DELETE'
            }).then(() => 
            {
                fetchFavorites(); 
            }).catch(error => console.error('Failed to remove album from favorites:', error));
        }
    }

    function displayMessage(message, type) 
    {
        const messageElement = document.getElementById('message-area');
        messageElement.textContent = message;
        messageElement.className = `message-${type}`; 
        messageElement.style.display = 'block'; 
        
        setTimeout(() => 
        {
            messageElement.style.display = 'none';
        }, 2000); 
    }
    
});