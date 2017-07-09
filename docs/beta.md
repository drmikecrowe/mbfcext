# Installing the Beta Version

To install the beta version of our extension, please follow these steps:

* If you have the current version of our extension installed, go to [Extension Settings](chrome://extensions/) and scroll down to our extension.  Uncheck the "Enable" box
![Disabled Extension](disable.png)
* Next, go to the Beta version of the extension in the [Chrome Web Store](https://chrome.google.com/webstore/detail/betaofficial-media-biasfa/janhmnkcmhhbkachkhmchiidolkpeafm) and install this extension
* As with all beta software, please report any issues.  

### First Run

The first time you run the extension, you will be presented with the options page.  Please try out the Collapse section as depicted below

![Collapse Section](collapse.png)

{% if site.disqus %}
<div id="disqus_thread"></div>
<script>
  var disqus_config = function () {
      this.page.url = "{{ page.url | prepend: site.url }}";  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = "{{ page.title }}"; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
  };
  (function() {  // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      s.src = '//{{ site.disqus }}.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
  })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
{% endif %}