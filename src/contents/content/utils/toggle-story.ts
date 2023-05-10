export const toggleStory = (story_class: string) => {
  const icon = document.getElementById(`${story_class}-icon`);
  const span = document.getElementById(`${story_class}-span`);
  if (!icon || !span) return;
  Array.from(document.getElementsByClassName(story_class)).forEach(function (el) {
    const e = el as HTMLElement;
    if (e && e.style) {
      if (e.style.display === "none") {
        e.style.display = "block";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        span.textContent = " Hide";
      } else {
        e.style.display = "none";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
        span.textContent = " Show";
      }
    }
  });
};
