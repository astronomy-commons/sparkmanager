define(
    [
        'base/js/namespace',
        'jquery',
        'require'
    ],
    function(
        Jupyter,
        $,
        requirejs
    ) {    
        return $.ajax(requirejs.toUrl('./nbextension.html')).then(
            function(html) {
                var container = document.createElement('div');
                container.id = "sparkmanager_ui";    
                container.innerHTML = html;
                Jupyter.toolbar.element.append(
                    container
                );
                var UI = {
                    container : container,
                    sparkLogo : document.getElementById('sparkmanager_sparkLogo'),
                    startButton : document.getElementById('sparkmanager_startButton'),
                    startButtonText : document.getElementById('sparkmanager_startButtonText'),
                    clusterSelect : document.getElementById("sparkmanager_clusterSelect"),
                    clusterStatus : document.getElementById("sparkmanager_clusterStatus"),
                    clusterStatusText : document.getElementById("sparkmanager_clusterStatusText"),
                    // applicationConfig : document.createElement("button"),
                    sparkConfig : document.getElementById("sparkmanager_clusterConfig"),
                    sparkConfigText :  document.getElementById("sparkmanager_clusterConfigText"),
                    sparkUI : document.getElementById("sparkmanager_sparkUI"),
                    sparkUIText : document.getElementById("sparkmanager_sparkUIText"),
                    configWindow : document.getElementById("sparkmanager_configWindow"),
                    configWindowClose : document.getElementById("sparkmanager_configWindowClose"),
                };
                return UI;
            }
        );
    }
)