$(function() {

    var base_server_url = "http://14.63.195.20:8450/";
    var current_selected_highway = "";




    $.ajax({
        dataType: 'jsonp',
        //data: "data=yeah",
        jsonpCallback: 'mycallback_news',
        url: base_server_url + 'getnavernews',
        success: function (data) {
            for (var i = 0; i<1; i++) {
                $("#news-updates").append('<h3><a href="'+
                    data.items[i].link +'">'+data.items[i].title+'</a></h3>');
                    //.append("<p>" + data.items[i].description + "</p>");
            }
            console.log(data)
        }
    });

    $.getJSON(base_server_url + "getHighwayNames?callback=?", function(data){
            var options = [];
            for (var i = 1; i<data.length; i++) {
                options.push("<option value='" + data[i].highway_name + "'>"+data[i].highway_name+"</option>")
            }
            current_selected_highway = data[1].highway_name;
            $("#highway_names_selector").html(options.join(''))
        });

    $( "#highway_names_selector" ).change(function() {
        current_selected_highway = $( this ).val();
        UpdateRoadStatistics();
    });




    var current_vehicle_id = "0";

    $( "#cars_list_selecter" ).change(function() {
        current_vehicle_id = $( this ).val();
        LoadCurrentVehiclesStats();
    });

    function LoadVehiclesNumbers() {
        $.ajax({
            dataType: 'jsonp',
            //data: "data=yeah",
            jsonpCallback: 'mycallback2',
            url: base_server_url + 'getVehiclesList',
            success: function(data) {
                if (data.length == null) { return; }

                var  _html = "";
                var list   = [];

                current_vehicle_id = data[0].car_id;

                for (var i = 0; i<data.length; i++) {


                    _html = "<h4><a id='remove'>"+data[i].car_id+"</a></h4>";
                    list.push('<option value="' + data[i].car_id + '">' + data[i].car_id + '</option>');

                    var removeLink = $(_html).click(function(e) {
                        current_vehicle_id = $(this).text()
                        //Click event handler here.
                    });

                    $("#vehiclesList").append(removeLink);
                }

                $("#cars_list_selecter").html(list.join('')).selectpicker('refresh');

                //console.log(_html);
            }
        });
    }

    LoadVehiclesNumbers();
    setInterval(LoadVehiclesNumbers, 75000);


    function LoadMainDataValues() {
        $.ajax({
            dataType: 'jsonp',
            //data: "data=yeah",
            jsonpCallback: 'mycallback_news',
            url: base_server_url + 'getConjunctionIndexWithFreeFlow/70',
            success: function (data) {

                $("#data_summary_congestion_value").html(Math.round(data.tindex * 100) + '% congestion');
                console.log(data)
            }
        });
        $.getJSON(base_server_url + "getCurrentRoadAverageSpeed?callback=?", function(data){
            console.log(data);
            $("#current_road_avg_speed").html(data.avg_speed);
        });

    }

    function LoadMyDrivingPatterns() {

        $.getJSON(base_server_url + "getCurrentCarDrivingSkills/" + current_vehicle_id + "?callback=?", function(data){
            console.log(data);
            $("#current_driving_skills").html(data.driving_skills.tindex);

            if (data.driving_skills.tindex == "Good Driving") {
                $(".my_page_emotions").attr("src","./img/car_02.png");
                $("#current_driving_skills").css('color', '#196F3D');
            }
            if (data.driving_skills.tindex == "Be Attentive") {
                $(".my_page_emotions").attr("src","./img/car_01.png");
                $("#current_driving_skills").css('color', '#D68910');
            }
            if (data.driving_skills.tindex == "Be Careful") {
                $(".my_page_emotions").attr("src","./img/car_03.png");
                $("#current_driving_skills").css('color', '#5499C7');
            }
            if (data.driving_skills.tindex == "Careful & Attentive") {
                $(".my_page_emotions").attr("src","./img/car_04.png");
                $("#current_driving_skills").css('color', '#B03A2E');
            }
        });

        $.getJSON(base_server_url + "getCurrentCarDrivingStyle/" + current_vehicle_id + "?callback=?", function(data){
            console.log(data);
            $("#current_driving_style").html(data.my_driving_style);
            //if (data.my_driving_style == "")
            if (data.my_driving_style == "Safe Driver") {
                $("#current_driving_style").css('color', '#196F3D');
            }
            if (data.my_driving_style == "Normal Driver") {
                //alert("HELLO");
                $("#current_driving_style").css('color', '#5499C7');
            }
            if (data.my_driving_style == "Aggressive Driver") {
                $("#current_driving_style").css('color', '#B03A2E');
            }
        });
    }

    LoadMyDrivingPatterns();
    setInterval(LoadMyDrivingPatterns, 5000);

    $("#a_data_perms_main_page").on('shown.bs.tab', function (e) {
        LoadMainDataValues();
        setInterval(LoadMainDataValues, 5000);
        var url = base_server_url + "getroadindexes/bukbuganseon?callback=?";
        $.getJSON(url, function(data){

            var rsi = data.all[0].total_acidients +
                (data.all[0].number_of_killed * 12) +
                (data.all[0].number_of_severely_injured * 6) +
                (data.all[0].number_of_lightly_injured * 3);

            console.log(rsi);
            var asi = ((data.all[0].number_of_killed * 12) +
                (data.all[0].number_of_severely_injured * 6) +
                (data.all[0].number_of_lightly_injured * 3)) /
                data.all[0].total_acidients;

            var abt = data.all[0].total_acidients;
            $("#road_saftey_index_value").html(Math.round(rsi, 2));
            $("#area_saftey_index_value").html(Math.round(asi, 2));
            $("#abt_saftey_index_value").html(Math.round(abt, 2));

        });
    });


    var basic_vehcile_speed_chart = Morris.Line({
        element: 'morris-one-line-chart',
        data: [],
        xkey: 'row_id',
        ykeys: ['avg_speed', 'min_speed', 'max_speed'],
        resize: true,
        lineWidth: 4,
        labels: ['avg_speed', 'min_speed', 'max_speed'],
        lineColors: ['#1ab394', "#005500", "#FF5733"],
        pointSize: 5,
        hideHover: 'always'
    });

    var basic_vehcile_speed_chart_single_car = Morris.Line({
        element: 'morris-one-line-chart_single_car',
        data: [],
        xkey: 'row_id',
        ykeys: ['avg_speed', 'avg_acceleration'],
        resize: true,
        lineWidth: 4,
        labels: ['avg_speed', 'avg_acceleration'],
        lineColors: ['#1ab394', "#005500"],
        pointSize: 5,
        hideHover: 'always'
    });


    function LoadVehiclesData() {
        $.ajax({
            dataType: 'jsonp',
            //data: "data=yeah",
            jsonpCallback: 'mycallback',
            url: base_server_url + 'getAvergeSpeed',
            success: function(data) {
                //console.log(data.results);
                $("#average_speed").html(data.results[0].avg_speed);
                $("#average_acc").html(data.results[0].avg_acceleration);
                $("#min_speed").html(data.results[0].min_speed);
                $("#max_speed").html(data.results[0].max_speed);

                $('svg').css({ width: '100%' });
                basic_vehcile_speed_chart.setData(data.results);
            }
        });
    }

    LoadVehiclesData();
    setInterval(LoadVehiclesData, 5000);


    function LoadCurrentVehiclesStats() {
        console.log(current_vehicle_id);
        if (current_vehicle_id == "0") {
            return;
        }
        $.ajax({
            dataType: 'jsonp',
            //data: "data=yeah",
            jsonpCallback: 'mycallback',
            url: base_server_url + 'getVehicleData/' + current_vehicle_id,
            success: function(data) {
                console.log(data.results);

                $("#average_acc_single_car").html(data.results[0].avg_acceleration);
                $("#min_speed_single_car").html(data.results[0].min_speed);
                $("#max_speed_single_car").html(data.results[0].max_speed);
                $("#current_speed_single_car").html(data.results[0].avg_speed);


                basic_vehcile_speed_chart_single_car.setData(data.results);
                $('svg').css({ width: '100%' });
                basic_vehcile_speed_chart_single_car.redraw();
            }
        });


        $.ajax({
            dataType: 'jsonp',
            //data: "data=yeah",
            jsonpCallback: 'mycallback_conjs',
            url: base_server_url + 'getConjunctionIndex/' + current_vehicle_id,
            success: function(data) {
                console.log(data);
                $("#current_tci_single_car").html(data.tindex);
            }
        });
    }


    $("#a_car_level_statistics").on('shown.bs.tab', function (e) {
        LoadCurrentVehiclesStats();
    });
    setInterval(LoadCurrentVehiclesStats, 5000);


    function UpdateRoadStatistics() {
        var url = base_server_url + "getroadindexes/" + current_selected_highway + "?callback=?";
        $.getJSON(url, function(data){

            $("#morris-bar-chart-week-rsi").html("");
            $("#morris-bar-chart-week-asi").html("");
            $("#morris-bar-chart-week-abt").html("");

            $("#morris-bar-chart-month-rsi").html("");
            $("#morris-bar-chart-month-asi").html("");
            $("#morris-bar-chart-month-abt").html("");

            $("#morris-bar-chart-hour-rsi").html("");
            $("#morris-bar-chart-hour-asi").html("");
            $("#morris-bar-chart-hour-abt").html("");


            var weekly_data = [];
            var montly_data = [];
            var hourly_data = [];

            var i = 0, rsi = 0, asi = 0, abt = 0;
            for (i = 0; i<data.weekly.length;i++) {
                rsi = data.weekly[i].total_acidients +
                    (data.weekly[i].number_of_killed * 12) +
                    (data.weekly[i].number_of_severely_injured * 6) +
                    (data.weekly[i].number_of_lightly_injured * 3);

                asi = ((data.weekly[i].number_of_killed * 12) +
                    (data.weekly[i].number_of_severely_injured * 6) +
                    (data.weekly[i].number_of_lightly_injured * 3)) /
                    data.weekly[i].total_acidients;

                abt = data.weekly[i].total_acidients;

                weekly_data.push({y: data.weekly[i].day_of_a_week, rsi: rsi, asi: asi, abt: abt})
            }

            for (i = 0; i<data.montly.length;i++) {
                rsi = data.montly[i].total_acidients +
                    (data.montly[i].number_of_killed * 12) +
                    (data.montly[i].number_of_severely_injured * 6) +
                    (data.montly[i].number_of_lightly_injured * 3);

                asi = ((data.montly[i].number_of_killed * 12) +
                    (data.montly[i].number_of_severely_injured * 6) +
                    (data.montly[i].number_of_lightly_injured * 3)) /
                    data.montly[i].total_acidients;

                abt = data.montly[i].total_acidients;

                montly_data.push({y: data.montly[i].recoded_date, rsi: rsi, asi: asi, abt: abt})
            }

            for (i = 0; i<data.hourly.length;i++) {
                rsi = data.hourly[i].total_acidients +
                    (data.hourly[i].number_of_killed * 12) +
                    (data.hourly[i].number_of_severely_injured * 6) +
                    (data.hourly[i].number_of_lightly_injured * 3);

                asi = ((data.hourly[i].number_of_killed * 12) +
                    (data.hourly[i].number_of_severely_injured * 6) +
                    (data.hourly[i].number_of_lightly_injured * 3)) /
                    data.hourly[i].total_acidients;

                abt = data.hourly[i].total_acidients;

                hourly_data.push({y: data.hourly[i].hour_of_day, rsi: rsi, asi: asi, abt: abt})
            }

            var m_bar_week_rsi = Morris.Bar({
                element: 'morris-bar-chart-week-rsi',
                data: weekly_data,
                xkey: 'y',
                ykeys: ['rsi'],
                labels: ['RSI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_week_asi = Morris.Bar({
                element: 'morris-bar-chart-week-asi',
                data: weekly_data,
                xkey: 'y',
                ykeys: ['asi'],
                labels: ['ASI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_week_abt = Morris.Bar({
                element: 'morris-bar-chart-week-abt',
                data: weekly_data,
                xkey: 'y',
                ykeys: ['abt'],
                labels: ['ABT'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });

            var m_bar_month_rsi = Morris.Bar({
                element: 'morris-bar-chart-month-rsi',
                data: montly_data,
                xkey: 'y',
                ykeys: ['rsi'],
                labels: ['RSI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_month_asi = Morris.Bar({
                element: 'morris-bar-chart-month-asi',
                data: montly_data,
                xkey: 'y',
                ykeys: ['asi'],
                labels: ['ASI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_month_abt = Morris.Bar({
                element: 'morris-bar-chart-month-abt',
                data: montly_data,
                xkey: 'y',
                ykeys: ['abt'],
                labels: ['ABT'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });

            var m_bar_hour_rsi = Morris.Bar({
                element: 'morris-bar-chart-hour-rsi',
                data: hourly_data,
                xkey: 'y',
                ykeys: ['rsi'],
                labels: ['RSI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_hour_asi = Morris.Bar({
                element: 'morris-bar-chart-hour-asi',
                data: hourly_data,
                xkey: 'y',
                ykeys: ['asi'],
                labels: ['ASI'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });
            var m_bar_hour_abt = Morris.Bar({
                element: 'morris-bar-chart-hour-abt',
                data: hourly_data,
                xkey: 'y',
                ykeys: ['abt'],
                labels: ['ABT'],
                hideHover: 'auto',
                resize: true,
                barColors: ['#1ab394']
            });


        });
    }

    $('#a_envt_level_statistics').on('shown.bs.tab', function (e) {


        UpdateRoadStatistics();
        /*
        var m_area = Morris.Area({
            element: 'morris-area-chart',
            data: [{period: '2010 Q1', iphone: 2666, ipad: null, itouch: 2647},
                {period: '2010 Q2', iphone: 2778, ipad: 2294, itouch: 2441},
                {period: '2010 Q3', iphone: 4912, ipad: 1969, itouch: 2501},
                {period: '2010 Q4', iphone: 3767, ipad: 3597, itouch: 5689},
                {period: '2011 Q1', iphone: 6810, ipad: 1914, itouch: 2293},
                {period: '2011 Q2', iphone: 5670, ipad: 4293, itouch: 1881},
                {period: '2011 Q3', iphone: 4820, ipad: 3795, itouch: 1588},
                {period: '2011 Q4', iphone: 15073, ipad: 5967, itouch: 5175},
                {period: '2012 Q1', iphone: 10687, ipad: 4460, itouch: 2028},
                {period: '2012 Q2', iphone: 8432, ipad: 5713, itouch: 1791}],
            xkey: 'period',
            ykeys: ['iphone', 'ipad', 'itouch'],
            labels: ['iPhone', 'iPad', 'iPod Touch'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true,
            lineColors: ['#87d6c6', '#54cdb4', '#1ab394'],
            lineWidth: 2,
            pointSize: 1
        });
        var m_dont = Morris.Donut({
            element: 'morris-donut-chart',
            data: [{label: "Download Sales", value: 12},
                {label: "In-Store Sales", value: 30},
                {label: "Mail-Order Sales", value: 20}],
            resize: true,
            colors: ['#87d6c6', '#54cdb4', '#1ab394'],
        });
        var m_bar = Morris.Bar({
            element: 'morris-bar-chart',
            data: [{y: '2006', a: 60, b: 50},
                {y: '2007', a: 75, b: 65},
                {y: '2008', a: 50, b: 40},
                {y: '2009', a: 75, b: 65},
                {y: '2010', a: 50, b: 40},
                {y: '2011', a: 75, b: 65},
                {y: '2012', a: 100, b: 90}],
            xkey: 'y',
            ykeys: ['a', 'b'],
            labels: ['Series A', 'Series B'],
            hideHover: 'auto',
            resize: true,
            barColors: ['#1ab394', '#cacaca'],
        });
        var m_line = Morris.Line({
            element: 'morris-line-chart',
            data: [{y: '2006', a: 100, b: 90},
                {y: '2007', a: 75, b: 65},
                {y: '2008', a: 50, b: 40},
                {y: '2009', a: 75, b: 65},
                {y: '2010', a: 50, b: 40},
                {y: '2011', a: 75, b: 65},
                {y: '2012', a: 100, b: 90}],
            xkey: 'y',
            ykeys: ['a', 'b'],
            labels: ['Series A', 'Series B'],
            hideHover: 'auto',
            resize: true,
            lineColors: ['#54cdb4', '#1ab394'],
        });
        */
        //m_area.redraw();


    });

});
