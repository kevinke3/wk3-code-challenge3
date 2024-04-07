document.addEventListener('DOMContentLoaded', function() {
  const BASE_URL = 'http://localhost:3000';

  // Function to fetch movie data when the page loads
  function fetchMovieData() {
    fetch(`${BASE_URL}/films`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch movie data');
        }
        return response.json();
      })
      .then(data => {
        updateMovieList(data);
        // Display details of the first movie
        if (data.length > 0) {
          fetchMovieDetails(data[0].id);
        }
      })
      .catch(error => {
        console.error('Error fetching movie data:', error);
      });
  }

  // Function to update the movie list in the UI
  function updateMovieList(movies) {
    const filmsList = document.getElementById('films');
    filmsList.innerHTML = ''; // Clear previous content

    movies.forEach(movie => {
      const listItem = document.createElement('li');
      listItem.className = 'film item';
      listItem.textContent = movie.title;
      listItem.dataset.movieId = movie.id;
      listItem.addEventListener('click', () => fetchMovieDetails(movie.id));
      
      // Check if the movie is sold out
      if (movie.tickets_sold >= movie.capacity) {
        listItem.classList.add('sold-out');
      }

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteMovie(movie.id, listItem);
      });

      listItem.appendChild(deleteButton);
      filmsList.appendChild(listItem);
    });
  }

  // Function to fetch details of a specific movie
  function fetchMovieDetails(movieId) {
    fetch(`${BASE_URL}/films/${movieId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        return response.json();
      })
      .then(data => {
        updateMovieDetails(data);
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
      });
  }

  // Function to update movie details in the UI
  function updateMovieDetails(movie) {
    const titleElement = document.getElementById('title');
    const runtimeElement = document.getElementById('runtime');
    const descriptionElement = document.getElementById('film-info');
    const showtimeElement = document.getElementById('showtime');
    const ticketsElement = document.getElementById('ticket-num');
    const posterElement = document.getElementById('poster');
    const buyTicketButton = document.getElementById('buy-ticket');

    titleElement.textContent = movie.title;
    runtimeElement.textContent = `${movie.runtime} minutes`;
    descriptionElement.textContent = movie.description;
    showtimeElement.textContent = movie.showtime;
    ticketsElement.textContent = movie.capacity - movie.tickets_sold;
    posterElement.src = movie.poster;

    // Add event listener to Buy Ticket button
    buyTicketButton.onclick = function() {
      if (movie.tickets_sold < movie.capacity) {
        const updatedTicketsSold = movie.tickets_sold + 1;
        const updatedData = { tickets_sold: updatedTicketsSold };

        fetch(`${BASE_URL}/films/${movie.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to buy ticket');
            }
            return response.json();
          })
          .then(data => {
            // Update movie details after buying ticket
            updateMovieDetails(data);
            // Record the purchase
            recordPurchase(movie.id);
          })
          .catch(error => {
            console.error('Error buying ticket:', error);
          });
      } else {
        console.log('Movie is sold out');
      }
    };
  }

  // Function to record a purchase
  function recordPurchase(movieId) {
    const purchaseData = {
      film_id: movieId,
      number_of_tickets: 1,
    };

    fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to record purchase');
        }
        return response.json();
      })
      .then(data => {
        console.log('Purchase recorded:', data);
      })
      .catch(error => {
        console.error('Error recording purchase:', error);
      });
  }

  // Function to delete a movie from the server
  function deleteMovie(movieId, listItem) {
    fetch(`${BASE_URL}/films/${movieId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete movie');
        }
        return response.json();
      })
      .then(data => {
        // Remove the film item from the list
        listItem.remove();
        console.log('Movie deleted:', data);
      })
      .catch(error => {
        console.error('Error deleting movie:', error);
      });
  }

  // Fetch movie data when the page loads
  fetchMovieData();
});
