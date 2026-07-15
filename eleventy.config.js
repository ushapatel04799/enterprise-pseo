export default function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(['njk', 'html']);
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addWatchTarget('./src/assets');

  // HTML, Inline CSS and JS Minification Transform
  eleventyConfig.addTransform("htmlMinifier", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      let minified = content
        .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
        .replace(/>\s+</g, "><")         // Collapse whitespaces between tags
        .replace(/\s{2,}/g, " ");        // Collapse multiple spaces
      return minified;
    }
    return content;
  });

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk', // Force Nunjucks for HTML files
    dir: {
      input: 'src',
      output: 'output',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
    },
  };
}
