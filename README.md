# bootstrap-periodsChooser
Periods chooser (year, quarter, month only - not a calendar!)

## Example:
Example page with [Periods Chooser](https://rinold.github.io/bootstrap-periodsChooser/)

#### Widget creation with default options:
```
$('#example-div').periodsChooser();
```

#### Changing periods mode ('year', 'quarter', 'month') after creation:
```
$('#example-div').periodsChooser('quarter');
```

### Getting the selected period:
After selection is updated the 'periods.date.changed' event is triggered with datetime variables passed via argument:

```
$('#example-div').on('periods.date.changed', function(e, date) {
    var periodStartDatetime = date.from; // Period start datetime
    var periodEndDatetime = date.to;     // Period end datetime
    // Do something basing on selected period
})
```

## Requires:

[Bootstrap 4](https://v4-alpha.getbootstrap.com/) 

[Font Awesome](http://fontawesome.io/)
