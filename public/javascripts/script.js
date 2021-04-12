validate.options = {format: "flat"};
validate.validators.presence.options = {message: "نمیتواند خالی باشد"};
validate.validators.fullMessages = false;
validate.validators.equality = function(value, options, key, attributes) {
    const other = attributes[options.with];
    if (value !== other) {
        const attr = validate.prettify(options.with);
        return options.message ||
            validate.format("برابر نیست با %{a}", {a: attr});
    }
};
let validation = [];
const usernameFormat = /^[^0-9](?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
const passwordFormat = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
const constraints = {
    first_name: {
        presence: true,
        length: {
            minimum: 3,
            message: "^مقدار ؛نام؛ باید 3 کاراکتر یا بیشتر باشد"
        }
    },
    last_name: {
        presence: true,
        length: {
            minimum: 3,
            message: "^مقدار ؛نام خانوادگی؛ باید 3 کاراکتر یا بیشتر باشد"
        }
    },
    email: {
        presence: true,
        email: {message: "^ایمیل وارد شده معتبر نیست"},
        length: {
            minimum: 7,
            message: "^ایمیل باید 7 کاراکتر یا بیشتر باشد"
        }
    },
    confirmPassword: {
        presence: true,
        equality: {with: "password"}
    },
    mobile: {
        presence: true,
        numericality: {message: "^مقدار ؛موبایل؛ عدد نیست"},
        length: {
            minimum: 11,
            message: "^مقدار ؛مویایل؛ باید 11 کاراکتر باشد"
        }
    },
    username: {
        presence: true,
        format: {
            pattern: usernameFormat,
            message: "^نام کاربری معتبر نیست"
        },
        length: {
            minimum: 4,
            message: "^نام کاربری باید 4 کاراکتر یا بیشتر باشد"
        }
    },
    password: {
        presence: true,
        format: {
            pattern: passwordFormat,
            message: "^کلمه عبور باید شامل حرف کوچک، حرف بزرگ، عدد و کاراکتر خاص باشد"
        },
        length: {
            minimum: 6,
            message: "^کلمه عبور باید 6 کاراکتر یا بیشتر باشد"
        }
    }
}
$(function () {
    const urlParser = window.location.href.split('/');
    $(document).on('keypress', function (e){
        if(parseInt(e.which) === 13){
            if(urlParser[urlParser.length-1] === "login") login();
            else signup();
        }
    });

    $('#login').on('click', login);
    $('#signup').on('click', signup);
    // choose active menu
    const pageRequest = window.location.href.split('/').pop();
    if(pageRequest)
        $(`a[href$="${pageRequest}"]`).parent().addClass('active');
    else
        $('.nav-link').first().parent().addClass('active');
});
const customAlert = (body, disappear = 0, bg = "danger", title = "Error") => {
    const container = $('.modal-body');
    let prettyBody = "<ul>";
    const alertModal = $('.modal');
    $('.modal-header').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('#modalClose').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('.modal-title').text(title);
    body.forEach(error => prettyBody += `<li>${error}</li>`);
    container.html(prettyBody+"</ul>");
    alertModal.modal('show');
    if(disappear) setTimeout(()=>alertModal.modal('hide'), disappear);
}
const login = ()=>{
    console.log('login');
    let username = $('#username').val();
    let password = $('#password').val();

    $.ajax({
        url: "/api/user/login",
        data: JSON.stringify({username, password}),
        contentType: "application/json",
        method: "POST"
    })
        .done(result => {
            if (result.result) {
                customAlert(["ورود با موفقیت انجام شد"], 0, "success", "Login");
                return setTimeout(()=> window.location.href = "/dashboard", 1000);
            }
            customAlert([result.error], 2000);
        })
        .fail(error => {
            customAlert(["خطای سرور"], 1000);
            console.log(error);
        });
}
const signup = ()=>{
    const data = {
        first_name: $('#first_name').val(),
        last_name: $('#last_name').val(),
        gender: $('#gender').val(),
        email: $('#email').val(),
        mobile: $('#mobile').val(),
        username: $('#username').val(),
        password: $('#password').val(),
        confirmPassword: $('#confirmPassword').val(),
    }
    validation = validate(data, constraints);
    if(data.gender === "0")
        validation.push("جنسیت را وارد نکرده اید.");
    $('.alert').hide();
    if (validation) return customAlert(validation)
    $.ajax({
        url: "/api/user/create",
        data: JSON.stringify(data),
        contentType: "application/json",
        method: "POST"
    })
        .done(result => {
            if (result.result)
                return customAlert(["ثبت نام تکمیل شد"], 3000, "success", "Register");
            customAlert([result.error], 3000);
        })
        .fail(error => {
            customAlert([error.responseText], 5000);
        });
}