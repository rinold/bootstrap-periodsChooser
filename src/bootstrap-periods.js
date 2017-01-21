(function ( $ ) {

    $.fn.periodsChooser = function (options) {
        $container = $(this);

        if (!$container.data('periods-opts')) {
            var opts = $.extend(true, {}, $.fn.periodsChooser.defaults, options);
            $container.attr('data-periods-opts', '');
            $container.data('periods-opts', opts);
        }
        else {
            var opts = $container.data('periods-opts');
            if (['month', 'quarter', 'year'].includes(options)) {
                opts.choiceMode = options;
            }
            else {
                $.extend(true, opts, options);
            }
            $container.data('periods-opts', opts);
        }
        $container.html('');

        var $chooser = $('<div>', {
            'class': 'periods-container btn-group',
            attr: {
                'data-range': (opts.rangeEnabled && opts.rangeToggleDefault),
                'data-mode': opts.choiceMode,
            }
        });

        var date = opts.choiceDefault;
        var sizedBtnClass = 'btn btn-' + opts.buttonClass;
        if (opts.buttonSize) {
            sizedBtnClass += ' btn-' + opts.buttonSize;
        }

        function updateDropdownText($dd) {
            var year = $dd.data('year');
            var value = $dd.data(opts.choiceMode);

            $dd.trigger('periods.update.text', [year, value]);
            $dd.find('.dropdown-toggle').text(
                opts.formatDropdownDate[opts.choiceMode](year, value)
            );
        }

        function createDropdown(rangeSide) {

            var $dropdown = $('<div>', {
                'class': 'periods-dropdown btn-group',
                attr: {
                    'data-range': rangeSide,
                    'data-year': date.getFullYear(),
                    'data-quarter': date.getQuarter(),
                    'data-month': date.getMonth(),
                },
                on: {
                    'hide.bs.dropdown': function () {
                        updateDropdownText($(this));
                    }
                },
            });

            var $dropdownBtn = $('<button>', {
                'class': 'periods-dropdown-btn dropdown-toggle ' + sizedBtnClass,
                attr: {
                    'data-toggle': 'dropdown',
                }
            })
            .dropdown()
            .appendTo($dropdown);

            var $dropdownMenu = $('<div>', {
                'class': 'periods-menu dropdown-menu dropdown-menu-right',
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
            if (opts.buttonSize) {
                $yearText.addClass('btn-' + opts.buttonSize);
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

            $choiceGroup = $('<div class="periods-choice-group">')
            .appendTo($dropdownMenu);

            function createQuarterChoices($choiceGroup) {
                var $itemsGroup = $('<div>', {
                    'class': "periods-quarter-group btn-group px-2",
                })
                .appendTo($choiceGroup);

                for (var i = 1; i < 5; i++) {
                    var $quarter = $('<button>', {
                        'class': sizedBtnClass + ' periods-choice',
                        text: 'Q' + i,
                        attr: {
                            'data-quarter': i,
                        },
                    })
                    .appendTo($choiceGroup);

                    if (i == date.getQuarter()) {
                        $quarter.addClass('active');
                    }
                }
            }

            function createMonthChoices($choiceGroup) {
                var monthNames = [
                    "Jan", "Feb", "Mar", "Apr",
                    "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"
                ];

                for (var n = 0; n < 3; n++) {
                    var $itemsGroup = $('<div>', {
                        'class': "periods-month-group btn-group w-100 px-2",
                    })
                    .appendTo($choiceGroup);

                    for (var m = 0; m < 4; m++) {
                        var i = m + 4 * n;
                        var $month = $('<button>', {
                            'class': sizedBtnClass + ' periods-choice w-25',
                            html: monthNames[i] + ' <sup>' + (i + 1) + '</sup>' ,
                            attr: {
                                'data-month': i,
                            },
                        })
                        .appendTo($itemsGroup);
                        if (n == 1) {
                            $month.addClass('my-2');
                        }

                        if (i == date.getMonth()) {
                            $month.addClass('active');
                        }
                    }
                }
            }

            var createChoices = {
                'year' : function () {},
                'quarter': createQuarterChoices,
                'month': createMonthChoices,
            };

            createChoices[opts.choiceMode]($choiceGroup);

            $dropdownMenu.on('click', '.periods-choice',  function () {
                var $this = $(this);
                $dropdownMenu.find('.periods-choice').removeClass('active');
                $this.addClass('active');

                var value = $this.data(opts.choiceMode);
                $dropdown.data(opts.choiceMode, value);
                $dropdown.dropdown('toggle');
            });

            if (opts.size) {
                $dropdown.addClass('btn-group-'+opts.size);
            }

            return $dropdown;
        }

        var $chooser = $('<div>', {
            'class': 'periods-container btn-group',
            attr: {
                'data-range': (opts.rangeEnabled && opts.rangeToggleDefault),
                'data-mode': opts.choiceMode,
            }
        });

        if (opts.rangeToggle) {
            var $btnToggleRange = $('<button>', {
                'class': sizedBtnClass + ' periods-range-toggle',
                html: '<i class="fa fa-calendar-plus-o"></i>',
                click: function () {
                    $(this).find('i').toggleClass('fa-calendar-minus-o fa-calendar-plus-o');
                    $chooser.find('.periods-togglable').toggle();
                    $chooser.data('range', !$chooser.data('range'));
                    dateChanged();
                }
            })
            .appendTo($chooser);
        }

        var $fromDropdown = createDropdown('from').addClass('periods-togglable');
        var $toDropdown = createDropdown('to');
        var $fromToArrow = $('<span>', {
            'class': 'btn periods-togglable',
            html: '<i class="fa fa-long-arrow-right"></i>',
        });
        if (opts.buttonSize) {
            $fromToArrow.addClass('btn-' + opts.buttonSize);
        }

        $chooser
        .append($fromDropdown)
        .append($fromToArrow)
        .append($toDropdown)
        .appendTo(this);

        updateDropdownText($fromDropdown);
        updateDropdownText($toDropdown);

        function dateChanged() {
            $this = $chooser;

            var $end = $toDropdown;
            var $start = $this.data('range') ? $fromDropdown : $end;

            var startYear = $start.data('year');
            var endYear = $end.data('year');

            if (opts.choiceMode == 'quarter') {
                var startQuarter = $start.data('quarter');
                var startMonth = startQuarter * 3 - 3;
                var endQuarter = $end.data('quarter');
                var endMonth = endQuarter * 3 - 1;
            }
            else if (opts.choiceMode == 'month') {
                var startMonth = $start.data('month');
                var endMonth = $end.data('month');
            }
            else {
                var startMonth = 0;
                var endMonth = 11;
            }

            var startDate = new Date(startYear, startMonth, 1);
            var endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59, 999);

            $this.trigger('periods.date.changed', {
                from: startDate,
                to: endDate,
            });
        }

        $chooser.on('hide.bs.dropdown', '.periods-dropdown', dateChanged);

        if (!opts.rangeToggleDefault) {
            $chooser.find('.periods-togglable').hide();
        }

        dateChanged();
        return this;
    };

    $.fn.periodsChooser.defaults = {
        choiceMode: 'month', // year, quarter, month
        choiceDefault: new Date(), // TODO: default range from-to?
        // From-to range choice configuration
        rangeEnabled: true,
        rangeToggle: true,
        rangeToggleDefault: false,
        // Bootstrap classes styling
        buttonSize: 'sm', // default (''), 'sm' or 'lg' TODO: remove 'sm', should be ''
        buttonClass: 'secondary',
        // Dropdown date formatters
        formatDropdownDate: {
            year: function (year) {
                return year;
            },
            quarter: function (year, quarter) {
                return 'Q' + quarter + '\'' + year.toString().substring(2, 4);
            },
            month: function (year, month) {
                var zero = (month < 9) ? '0' : '';
                return zero + (month + 1).toString() + '/' + year.toString().substring(2, 4);
            },
        },
    };

    Date.prototype.getQuarter = function () {
        return Math.floor(this.getMonth() / 3) + 1;
    }

} ( jQuery ));
