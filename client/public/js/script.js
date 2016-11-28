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
Module('regis-schedule',
    () => {
        return ($('#upload-regis-schedule').length > 0);
    },
    () => {
        const button = $('#upload-regis-schedule');
        button.click(() => {
            button.text('Downloading...');
            $.ajax({
                url: 'http://intranet.regis.org/downloads/outlook_calendar_import/outlook_schedule_download.cfm',
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp',
                success: function (data) {
                    console.log(data);
                    button.text('Sucessfully downloaded schedule!');
                },
                error: function (xhr, status) {
                    alert('Failed to download Regis schedule automatically. Please make sure you are logged in to the Intranet.');
                    button.text('Failed to download schedule.');
                }
            });
        });
    }
);