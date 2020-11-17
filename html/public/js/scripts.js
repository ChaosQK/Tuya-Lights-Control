$(document).ready(function () {
    var sock = io('http://192.168.5.**:8333');

    var type = '';
    var color = '';

    sock.on('broadcast', function (data) {
        console.log(data);
        //console.log(data);
        //type = data['21'];
        color = data['24'];

        changeFromData(data);
        /*var obj = JSON.parse(data);
        if(obj.message) {
            $('#message').text(obj.message);
        } else {
            $('#timestamp').text(obj.timestamp);
            $('#clients').text(obj.clients);
        }*/
    });

    var lonoff = false;

    $(".light").on('click', function() {
        sock.emit('message', {data: 'onoff', '20': !lonoff});
        lonoff = !lonoff;
    });

    $("#luminosity-slider").on('input change', function() {
        var val = Math.round(this.value / 10);
        $("#luminosity-value").html(val + "%");
    });

    $("#contrast-slider").on('input change', function() {
        var val = Math.round(this.value / 10);
        $("#contrast-value").html(val + "%");
    });

    $("#r-slider").on('input change', function() {
        var val = Math.round(this.value);
        $("#r-value").html(val);
        var r = this.value;
        var g = $("#g-slider").val();
        var b = $("#b-slider").val();
        $('#color-circle').css({'background-color': 'rgb(' + r + ',' + g + ',' + b + ')'});
    });

    $("#g-slider").on('input change', function() {
        var val = Math.round(this.value);
        $("#g-value").html(val);
        var r = $("#r-slider").val();
        var g = this.value;
        var b = $("#b-slider").val();
        $('#color-circle').css({'background-color': 'rgb(' + r + ',' + g + ',' + b + ')'});
    });

    $("#b-slider").on('input change', function() {
        var val = Math.round(this.value);
        $("#b-value").html(val);
        var r = $("#r-slider").val();
        var g = $("#g-slider").val();
        var b = this.value;
        $('#color-circle').css({'background-color': 'rgb(' + r + ',' + g + ',' + b + ')'});
    });

    $("#white-input").on('click', function() {
        sock.emit('message', {data: 'colortype', '21': 'white'});
        $('.rgb-sliders').hide();
        $('.lumcon-sliders').hide();
    });

    $("#color-input").on('click', function() {
        sock.emit('message', {data: 'colortype', '21': 'colour'});
        $('.rgb-sliders').show();
        $('.lumcon-sliders').show();
    });

    function intervalForRGB() {
        setInterval(function () {
            if(color !== getHSVString())
            {
                if(type === 'colour')
                    sock.emit('message', {data: 'color', '24': getHSVString(), '28': '1' + getHSVString() + '00000000'});
            }
        }, 5000)
    }
    intervalForRGB();

    function getHSVString()
    {
        var R = Math.round($("#r-slider").val());
        var G = Math.round($("#g-slider").val());
        var B = Math.round($("#b-slider").val());
        var hsv = rgb2hsv(R, G, B);
        var hexH = repairHex(hsv.h.toString(16));
        var hexS = repairHex((hsv.s*10).toString(16));
        var hexV = repairHex((hsv.v*10).toString(16));
        return "0" + hexH + "0" + hexS + "0" + hexV;
    }

    function repairHex(hexString)
    {
        var newHex = hexString;
        for(var i = 0; i < 3 - hexString.length; ++i)
        {
            newHex = "0" + newHex;
        }
        return newHex;
    }

    function changeFromData(data) {
        if(data.hasOwnProperty(20))
        {
            lonoff = data[20];
            if(!data[20]) {
                $('#color-circle').animate({backgroundColor: "rgba(0, 0, 0, 0)"}, 400);
                $('.light').removeClass("mdi-lightbulb");
                $('.light').addClass("mdi-lightbulb-outline");
                $('#lightoff-text').animate({opacity: 1}, 400);
                $('.main-sliders').animate({opacity: 0}, 400);
                $('.color-picker').animate({opacity: 0}, 400);
            }
            else {
                if(type === 'white')
                    $('#color-circle').animate({backgroundColor: "rgba(255, 249, 186, 1)"}, 200);
                $('.light').removeClass("mdi-lightbulb-outline");
                $('.light').addClass("mdi-lightbulb");
                $('#lightoff-text').animate({opacity: 0}, 200);
                $('.main-sliders').animate({opacity: 1}, 200);
                $('.color-picker').animate({opacity: 1}, 400);
            }
        }

        if(data.hasOwnProperty(24))
        {
            var h = parseInt(data[24][1] + data[24][2] + data[24][3], 16);
            var u = parseInt(data[24][5] + data[24][6] + data[24][7], 16)/10;
            var v = parseInt(data[24][9] + data[24][10] + data[24][11], 16)/10;
            var rgb = hsvToRgb(h, u, v);
            $("#r-slider").val(rgb[0]);
            $("#g-slider").val(rgb[1]);
            $("#b-slider").val(rgb[2]);

            $("#r-value").html(rgb[0]);
            $("#g-value").html(rgb[1]);
            $("#b-value").html(rgb[2]);

            if(lonoff && type === 'colour')
                $("#color-circle").animate({backgroundColor: "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"});
        }

        if(data.hasOwnProperty(21))
        {
            var colorType = data[21];
            if(colorType !== type)
            {
                type = colorType;
                if(colorType === 'white')
                {
                    if(lonoff)
                        $('#color-circle').animate({backgroundColor: "rgb(255, 249, 186)"}, 200);
                    $('#white-input').prop('checked', true).trigger('click');
                    $('#color-input').prop('checked', false);
                    $('.colour-sliders').hide();
                    $('.lumcon-sliders').hide();
                }
                else
                {
                    $('#white-input').prop('checked', false);
                    $('#color-input').prop('checked', true).trigger('click');
                }
            }
        }
    }

    /*var number = 1000;
    var hex = number.toString(16)
    parseInt(hex, 16)*/

    function rgb2hsv (r, g, b) {
        let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
        rabs = r / 255;
        gabs = g / 255;
        babs = b / 255;
        v = Math.max(rabs, gabs, babs),
            diff = v - Math.min(rabs, gabs, babs);
        diffc = c => (v - c) / 6 / diff + 1 / 2;
        percentRoundFn = num => Math.round(num * 100) / 100;
        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(rabs);
            gg = diffc(gabs);
            bb = diffc(babs);

            if (rabs === v) {
                h = bb - gg;
            } else if (gabs === v) {
                h = (1 / 3) + rr - bb;
            } else if (babs === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(percentRoundFn(s * 100)),
            v: Math.round(percentRoundFn(v * 100))
        };
    }

    function hsvToRgb(h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;

        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        s /= 100;
        v /= 100;

        if(s == 0) {
            r = g = b = v;
            return [
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255)
            ];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch(i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;

            case 1:
                r = q;
                g = v;
                b = p;
                break;

            case 2:
                r = p;
                g = v;
                b = t;
                break;

            case 3:
                r = p;
                g = q;
                b = v;
                break;

            case 4:
                r = t;
                g = p;
                b = v;
                break;

            default:
                r = v;
                g = p;
                b = q;
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

});
