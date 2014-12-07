// Custom scripts belonging to Admingenerator
;(function(window, $, undefined){
    var S2A = window.S2A || {};
    window.S2A = S2A;

    S2A.singleActionsManager = function(options){
        this.options = $.extend({}, {
                containerSelector: 'document',
                buttonSelector: 'a.object-action'
            },
            options
        );
        $(this.options.containerSelector).on('click', this.options.buttonSelector, this.clickHandler.bind(this));
    };

    S2A.singleActionsManager.prototype = {
        clickHandler: function(evt){
            var $elt = $(evt.currentTarget);

            if (!this.isConfirmed($elt)) {
                evt.preventDefault();
                return;
            }

            if (this.isProtected($elt)) {
                evt.preventDefault();
                this.sendSecured($elt);
            }
        },

        isConfirmed: function($elt){
            // TODO: move confirm() to custom popin
            return !$elt.data('confirm') || confirm($elt.data('confirm'));
        },

        isProtected: function($elt){
            return !!$elt.data('csrf-token');
        },

        sendSecured: function($elt){
            // Transform in POST request
            var $form = $('<form />').attr({
                method: 'POST',
                action: $elt.attr('href'),
                style:  'visibility: hidden'
            }).appendTo($('body'));
            // Add CSRF protection token
            $('<input />').attr({
                type:   'hidden',
                name:   '_csrf_token',
                value:  $elt.data('csrf-token')
            }).appendTo($form);
            // TODO: add pre-submit trigger
            $form.submit();
            // TODO: add post-submit trigger
        }
    };

    S2A.batchActionsManager = function(options){
        this.options = $.extend( {}, {
                containerSelector: 'document',
                actionSelector: 'select[name=action]',
                toggleSelector: 'input[name=batch_select_all]',
                elementSelector: 'input[name="selected[]"]',
                noActionValue: 'none',
                noElementSelectedMessage: 'You have to select at least one element.'
            },
            options
        );

        this.allElementsToggleButton = $(this.options.containerSelector).find(this.options.toggleSelector);
        this.actionInputSelector = $(this.options.containerSelector).find(this.options.actionSelector);
        $(this.options.containerSelector).find('*[type=submit]').hide();

        this.actionInputSelector.on('change', this.selectedActionChangedHandler.bind(this));
        this.allElementsToggleButton.on('ifChecked ifUnchecked', this.allElementsChangedHandler.bind(this));
    };

    S2A.batchActionsManager.prototype = {
        selectedActionChangedHandler: function(evt){
            var $elt = $(evt.currentTarget);
            if (!this.isValidActionSelected($elt.val())) {
                return;
            }

            if (!this.hasElementsSelected()) {
                // TODO: move this to a popin or dynamic message displayer
                alert(this.options.noElementSelectedMessage);
                $elt.val(this.options.noActionValue);
                return;
            }

            if (!this.isConfirmed($elt)) {
                $elt.val(this.options.noActionValue);
                return;
            }

            // TODO: pre-submit trigger
            // Send the form
            $elt[0].form.submit();
        },

        allElementsChangedHandler: function(evt){
            $(this.options.elementSelector)
                .prop('checked', $(evt.currentTarget).is(':checked'))
                .iCheck('update');
        },

        isValidActionSelected: function(actionValue){
            return actionValue != this.options.noActionValue;
        },

        hasElementsSelected: function(){
            return 0 !== $(this.options.containerSelector + ' ' + this.options.elementSelector).filter(':checked').length;
        },

        isConfirmed: function($elt){
            var $selectedOption = $(':selected', $elt);

            if (0 == $selectedOption.length) {
                return false;
            }

            return !$selectedOption.data('confirm') || confirm($selectedOption.data('confirm'));
        }
    };

    // Force first tab to be displayed
    $('.nav-tabs *[data-toggle="tab"]:first').click();

    // Object actions
    if (S2A.hasOwnProperty('singleActionsAdminOptions')) {
        new S2A.singleActionsManager(S2A.singleActionsAdminOptions);
    }
    // Generic actions
    if (S2A.hasOwnProperty('genericActionsAdminOptions')) {
        new S2A.singleActionsManager(S2A.genericActionsAdminOptions);
    }
    // Batch actions
    if (S2A.hasOwnProperty('batchActionsAdminOptions')) {
        new S2A.batchActionsManager(S2A.batchActionsAdminOptions);
    }
})(window, jQuery);