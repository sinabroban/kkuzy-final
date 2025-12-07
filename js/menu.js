$(function () {
    $('.gnb li').hover(function () {
        var $ul = $('ul', this);
        clearTimeout($ul.data('timer'));
        $ul.css('display', 'block');
        $ul.stop(true, false).animate({ opacity: '1', top: '60px' }, 300);
    }, function () {
        var $ul = $('ul', this);
        var timer = setTimeout(function () {
            $ul.stop(true, false).animate({ opacity: '0', top: '52px' }, 300, function () {
                $(this).css('display', 'none');
            });
        }, 50);
        $ul.data('timer', timer);
    });
});
