(function ( $ ) {

    $.fn.periodsChooser = function(options) {

        Date.prototype.getQuarter = function () {
            return Math.floor(this.getMonth() / 3) + 1;
        }

        var settings = $.extend({
            choiceMode: 'quarter', // year, quarter, month
            choiceDefault: new Date(), // TODO: default range from-to?
            choiceMax: new Date(),
            // From-to range choice configuration
            rangeEnabled: true,
            rangeToggle: true,
            rangeToggleDefault: false,
            // Bootstrap classes styling
            buttonSize: 'sm', // default (''), 'sm' or 'lg' TODO: remove 'sm', should be ''
            buttonClass: 'secondary',
        }, options);

        var date = settings.choiceDefault;
        var sizedBtnClass = 'btn btn-' + settings.buttonClass;
        if (settings.buttonSize) {
            sizedBtnClass += ' btn-' + settings.buttonSize;
        }

        function updateDropdownText($dropdown) {
            var year = $dropdown.data('year');

            if ($dropdown.parent().data('mode') == 'quarter') {
                var quarter = $dropdown.data('quarter');
                $dropdown.find('.dropdown-toggle').text(
                    'Q' + quarter + '\'' + year.toString().substring(2, 4) + ' '
                );
            }
        }

        function dropdown(fromTo) {
            var $dropdown = $('<div>', {
                'class': 'periods-dropdown btn-group',
                attr: {
                    'data-range': fromTo,
                    'data-year': date.getFullYear(),
                    'data-quarter': date.getQuarter(),
                    'data-month': date.getMonth(),
                },
                on: {
                    'hide.bs.dropdown': function () {
                        updateDropdownText($(this));
                    },
                },
            });

            var $dropdownBtn = $('<button>', {
                'class': sizedBtnClass + ' dropdown-toggle',
                attr: {
                    'data-toggle': 'dropdown',
                },
            })
            .dropdown()
            .appendTo($dropdown);

            var $dropdownMenu = $('<div>', {
                'class': 'periods-menu dropdown-menu',
                click: function (event) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                },
            });

            var $yearChoice = $('<div>', {
                'class': 'periods-year-choice text-center px-2',
            });

            $('<button>', {
                    'class': sizedBtnClass + ' btn-arrow pull-left',
                    html: '<i class="fa fa-arrow-left"></i>',
                    attr: {
                        'data-inc': -1,
                    },
            })
            .appendTo($yearChoice);

            var $yearText = $('<span>', {
                'class': 'btn periods-year',
                text: date.getFullYear(),
            })
            .appendTo($yearChoice);
            if (settings.buttonSize) {
                $yearText.addClass('btn-' + settings.buttonSize);
            }

            $('<button>', {
                    'class': sizedBtnClass + ' btn-arrow pull-right',
                    html: '<i class="fa fa-arrow-right"></i>',
                    attr: {
                        'data-inc': 1,
                    },
            })
            .appendTo($yearChoice);

            $yearChoice.on('click', '.btn-arrow', function () {
                var year = $dropdown.data('year') + $(this).data('inc');
                $yearChoice.find('.periods-year').text(year);
                $dropdown.data('year', year);
            });

            $dropdownMenu
            .append($yearChoice)
            .append('<div class="dropdown-divider"></div>')
            .appendTo($dropdown);

            if (settings.choiceMode == 'quarter') {
                var $itemsGroup = $('<div>', {
                    'class': "periods-quarter-item btn-group px-2",
                })
                .appendTo($dropdownMenu);

                for (var i = 1; i < 5; i++) {
                    var $quarter = $('<button>', {
                        'class': sizedBtnClass + ' periods-choice',
                        text: 'Q' + i,
                        attr: {
                            'data-quarter': i,
                        },
                        click: function () {
                            var $this = $(this);
                            $dropdown.find('.periods-choice').removeClass('active');
                            $this.addClass('active');

                            var quarter = $this.data('quarter');
                            $dropdown.data('quarter', quarter);
                            $dropdown.dropdown('toggle');
                        }
                    })
                    .appendTo($itemsGroup);

                    if (i == date.getQuarter()) {
                        $quarter.addClass('active');
                    }
                }
            }

            if (settings.size) {
                $dropdown.addClass('btn-group-'+settings.size);
            }

            return $dropdown;
        }

        var $chooser = $('<div>', {
            'class': 'periods-container btn-group',
            attr: {
                'data-range': (settings.rangeEnabled && settings.rangeToggleDefault),
                'data-mode': settings.choiceMode,
            }
        });

        if (settings.rangeToggle) {
            var $btnToggleRange = $('<button>', {
                'class': sizedBtnClass + ' periods-range-toggle',
                html: '<i class="fa fa-calendar-plus-o"></i>',
                click: function () {
                    $(this).find('i').toggleClass('fa-calendar-minus-o fa-calendar-plus-o');
                    $chooser.find('.periods-togglable').toggle();
                    $chooser.data('range', !$chooser.data('range'));
                }
            })
            .appendTo($chooser);
        }

        var $fromDropdown = dropdown('from').addClass('periods-togglable');
        var $toDropdown = dropdown('to');
        var $fromToArrow = $('<span>', {
            'class': 'btn periods-togglable',
            html: '<i class="fa fa-long-arrow-right"></i>',
        });
        if (settings.buttonSize) {
            $fromToArrow.addClass('btn-' + settings.buttonSize);
        }

        $chooser
        .append($fromDropdown)
        .append($fromToArrow)
        .append($toDropdown)
        .appendTo(this);

        updateDropdownText($fromDropdown);
        updateDropdownText($toDropdown);

        $chooser.on('hide.bs.dropdown', '.periods-dropdown', function () {
            $this = $chooser;

            var $end = $this.find('.periods-dropdown[data-range="to"]');
            if ($this.data('range')) {
                var $start = $this.find('.periods-dropdown[data-range="from"]');
            }
            else {
                var $start = $end;
            }

            var startYear = $start.data('year');
            var endYear = $end.data('year');

            if ($this.data('mode') == 'quarter') {
                var startQuarter = $start.data('quarter');
                var startMonth = startQuarter * 3 - 3;
                var endQuarter = $end.data('quarter');
                var endMonth = endQuarter * 3;
            }

            var startDate = new Date(startYear, startMonth, 1);
            var endDate = new Date(endYear, endMonth, 0, 23, 59, 59, 999);

            $this.trigger('periods.date.changed', {
                date: {
                    from: startDate,
                    to: endDate,
                }
            });
        });

        if (!settings.rangeToggleDefault) {
            $chooser.find('.periods-togglable').hide();
        }

        return this;
    };

}( jQuery ));
