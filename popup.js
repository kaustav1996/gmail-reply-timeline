document.getElementById('toggle-btn').addEventListener('click', () => {
    const container = document.getElementById('timeline-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });