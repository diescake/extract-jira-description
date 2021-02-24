(() => {
  const promptTicketId = () => {
    const lastEnteredId = localStorage.getItem('lastEnteredId');

    const id = prompt('Enter issue key. (e.g.: smart-123)', lastEnteredId ?? '');
    if (!id) return '';

    localStorage.setItem('lastEnteredId', id);
    return id.toUpperCase();
  };

  const getPrintPageUrl = id => `/si/jira.issueviews:issue-html/${id}/${id}.html`;

  const pushToClipBoard = text => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);

    ta.select();
    document.execCommand('copy');

    document.body.removeChild(ta)
  };

  /* NOTE: Toy implementation, but Pandoc is too much. */
  const textileToMarkdown = textile =>
    textile
      .split('\n')
      .map(text =>
        text
          /* Bullet lists */
          .replace(/^\*\*\*\*\* /g, '        * ')
          .replace(/^\*\*\*\* /g, '      * ')
          .replace(/^\*\*\* /g, '    * ')
          .replace(/^\*\* /g, '  * ')

          /* Numbered lists */
          .replace(/^#### /g, '      a. ')
          .replace(/^### /g, '    1. ')
          .replace(/^## /g, '  a. ')
          .replace(/^# /g, '1. ')

          /* Headings */
          .replace(/^h1. /g, '# ')
          .replace(/^h2. /g, '## ')
          .replace(/^h3. /g, '### ')
          .replace(/^h4. /g, '#### ')
          .replace(/^h4. /g, '#### ')

          /* Hyper link */
          .replace(/\[(.+)\|(.+)\]/g, '[$1]($2)')

          /* Line block */
          .replace(/{{(.+)}}/g, '`$1`')

          /* Bold */
          .replace(/\*(.+)\*/g, '**$1**')

          /* Strike-through */
          .replace(/\-(.+)\-/g, '~~$1~~')

    ).join('\n');

  const main = async () => {
    if (!location.host.includes('.atlassian.net')) {
      alert('Please run after opening JIRA on your browser.');
      return;
    }

    const id = promptTicketId();
    if (!id) return;

    const div = await fetch(getPrintPageUrl(id))
      .then(res => res.text())
      .then(text => {
        const html = (new DOMParser()).parseFromString(text, 'text/html');
        return html.getElementById('descriptionArea');
      });

    if (!div || !div.innerText) {
      alert(`At ${id}, the "description" field is empty.`);
      return;
    }

    /* NOTE: Let the browser render the div to prevent weird line break issues. */
    document.body.appendChild(div);
    const description = document.getElementById('descriptionArea').innerText.trim();
    document.body.removeChild(div);

    pushToClipBoard(textileToMarkdown(description));

    alert('Copy done !👍')
  };

  main().catch(e => alert(e));
})();
