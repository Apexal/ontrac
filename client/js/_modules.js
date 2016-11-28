let modules = [];

const PAGE = window.location.pathname;
const ORIGINALTITLE = $("title").text();

function Module(name, check, body) {
    if (!check()) return;

    modules.push({
        name: name,
        run: body
    });
}

$(() => {
    modules.sort(function(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    modules.forEach((module) => {
        console.log(module.name);
        module.run();
    });
});