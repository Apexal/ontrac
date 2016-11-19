// All helper methods for all views.

const linkTitles = {
    '/': 'The home page.',
    '/login': 'Login to OnTrac with your Regis Google account.',
    '/about': 'Some info on the site.',
    'https://github.com/Apexal/ontrac': 'View the code behind OnTrac. 100% open-source!'
}

module.exports = {
    activeLink: (href, current) => {
        current = (current == '/home' ? '/' : current);
        if (href == current) {
            return 'active';
        }
    },
    /* Determines what url the navbar link should point to.
       If the link it points to is the current page, let it be '#'
       otherwise its just the url.
     */
    decideHref: (href, current) => {
        current = (current == '/home' ? '/' : current);
        if (href == current) return '#';
        return href;
    },
    getTitle: (url) => {
        url = (url == '/home' ? '/' : url);
        return linkTitles[url];
    },
    jsPaths: (path) => {
        let paths = ['index.js'];
        const urlParts = path.split("/").filter((value) => { return value.length > 0 });
        for (let p in urlParts) {
            const path = urlParts.slice(0, p+1).join('.') + '.js';
            paths.push(path);
        }

        return paths;
    }
};