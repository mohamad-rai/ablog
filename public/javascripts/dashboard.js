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
}
const passwordConstraints = {
    oldPassword: {
        presence: true
    },
    confirmPassword: {
        presence: true,
        equality: {with: "password"}
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
let editor;
$(function(){
    const genderSelect = $('#gender');
    editor = new FroalaEditor('.froala-editor', {
        language: 'fa',
        // imageUploadParam: 'articlePhoto',
        imageManagerDeleteURL: '/delete_image',
        imageUploadURL: '/api/file/froala-image',
        imageUploadMethod: 'POST',
        imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
        events: {
            'image.beforeUpload': function (files) {
                console.log('file is going to upload');
            },
            'image.uploaded': response => customAlert('عکس اپلود شد', 500, 'success', 'upload'),
            'image.error': (error, response) => {
                switch (error.code){
                    case 1: customAlert("خطا در آپلود عکس (لینک آپلود خراب شده)"); break;
                    case 2: customAlert("آدرس عکس از سمت سرور دریافت نشد"); break;
                    case 3: customAlert("خطایی در آپلود فایل رخ داد"); break;
                    case 4: customAlert("خطا در تجزیه داده"); break;
                    case 5: customAlert("حجم فایل بالا است"); break;
                    case 6: customAlert("فرمت فایل نامعتبر است"); break;
                    case 7: customAlert("مرورگر شما نامعتبر است"); break;

                }
            }
        }
    });
    if(typeof genderSelect !== "undefined")
        genderSelect.val($('#genderValue').val());
    $('#updateForm').submit( function(e){
        e.preventDefault();
        const data = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            gender: $('#gender').val(),
            email: $('#email').val(),
            mobile: $('#mobile').val(),
            username: $('#username').val(),
        }
        validation = validate(data, constraints);
        if(data.gender === "0")
            validation.push("جنسیت را وارد نکرده اید.");
        if (validation) return customAlert(validation);
        const updateInfo = $.ajax({
            url: "/api/user/update",
            data: JSON.stringify(data),
            contentType: "application/json",
            method: "PUT"
        })
            .fail(error => {
                customAlert(error.responseText)
            });
        // upload avatar
        const updateFormData = new FormData();
        const avatarImage = $('#avatar')[0].files;
        if(avatarImage.length <= 0) {
            $.when(updateInfo).done(result=>{
                if(result.result){
                    customAlert(["پروفایل آپدیت شد!"], 2000, "success", "Update");
                    return setTimeout(()=>window.location.href = "/dashboard/profile", 2000);
                }
                customAlert(result.error);
            })
            return false;
        }
        updateFormData.append('avatar', avatarImage[0]);

        const updateAvatar = $.ajax({
            url: "/api/file/avatar",
            method: "post",
            data: updateFormData,
            mimeType: "multipart/form-data",
            contentType: false,
            processData: false
        })
            .fail(error => {
                customAlert(error.responseJSON.error);
            });

        $.when(updateInfo, updateAvatar).done((infoResult, avatarResult)=>{
            let errorMessage = "";
            if(!infoResult[0].result)
                errorMessage += infoResult.error + "<br>";
            if(!JSON.parse(avatarResult[0]).result)
                errorMessage += avatarResult.error;
            if(errorMessage !== "") {
                if(infoResult[0].result)
                    errorMessage += "<br> اطلاعات آپدیت شد ولی آواتار آپلود نشد!!!";
                return customAlert(errorMessage);
            }

            customAlert(["پروفایل آپدیت شد!"], 2000, "success", "Update");
            setTimeout(()=>window.location.href = "/dashboard/profile", 2000);
        });
    });
    $('#updatePassword').on('click', ()=>{
        const data = {
            oldPassword: $('#oldPassword').val(),
            password: $('#password').val(),
            confirmPassword: $('#confirmPassword').val()
        };
        const validation = validate(data, passwordConstraints);
        if(data.oldPassword === "" || data.password === "" || data.confirmPassword === "")
            validation.push("ورود همه فیلد ها اجباری است");
        if(validation) return customAlert(validation);
        $.ajax({
            url: "/api/user/update-password",
            data: JSON.stringify(data),
            contentType: "application/json",
            method: "PATCH"
        })
            .done(result => {
                if (result.result) {
                    customAlert(["کلمه عبور آپدیت شد"], 3000, "success", "Password Update");
                    return setTimeout(()=>window.location.href = "/api/user/logout", 3000);
                }
                customAlert(result.error);
            })
            .fail(error => {
                customAlert(error.responseJSON.error);
            });
    });
    $('#photo').on('change', function(){
        if($(this).val()){
            $('.choose-photo').hide();
            $('.delete-photo').show();
        }
    });
    $('.delete-photo').on('click', ()=>{
        $('#photo').val(null);
        $('.delete-photo').hide();
        $('.choose-photo').show();
    });
    $('#saveArticle').on('click', function () {
        const data = {
            title: $('#title').val(),
            content: editor.html.get()
        }
        const request = $(this).data('type') === "create" ? "create" : `update/${$(this).data('id')}`;
        $.ajax({
            url: `/api/article/${request}`,
            data: JSON.stringify(data),
            contentType: "application/json",
            method: "POST"
        }).done(result => {
            if (result.result) {
                const fd = new FormData();
                const articlePhoto = $('#photo')[0].files;
                if (articlePhoto.length <= 0) {
                    customAlert(["مقاله با موفقیت منتشر شد."], 2000, "success", "Update");
                    $('#title').val('');
                    editor.html.set('');
                    return;
                }
                fd.append('articlePhoto', articlePhoto[0]);
                fd.append('articleId', result.article._id);
                $.ajax({
                    url: "/api/file/article-image",
                    method: "POST",
                    data: fd,
                    mimeType: "multipart/form-data",
                    contentType: false,
                    processData: false
                }).done(result => {
                    result = JSON.parse(result);
                    if (result.result) {
                        customAlert(["مقاله با موفقیت منتشر شد."], 2000, "success", "Update");
                        $('#title').val(null);
                        editor.html.set('');
                        $('#photo').val(null);
                        $('#clearPhoto').hide();
                        $('#photoLabel').show();
                        return;
                    }
                    customAlert(result.error);
                })
                    .fail(err => {
                        customAlert(err.responseJSON.error);
                    });
                return;
            }
            customAlert(result.error);
        })
            .fail(err => {
                customAlert(err.responseJSON.error);
            });
    });
    $('.deleteArticle').on('click', function(){
        const deleteConfirm = confirm("آیا از حذف این مقاله اطمینان دارید؟");
        if(!deleteConfirm) return false;
        const articleId = $(this).data('id');
        console.log(articleId);
        $.ajax({
            url: "/api/article/delete/"+articleId,
            method: "delete"
        })
            .done(result=>{
                if(result.result) {
                    customAlert(["مقاله با موفقیت حذف شد"], 3000, "success", "Delete Article");
                    return setTimeout(()=>window.location.href = "/dashboard/articles", 3000);
                }
                customAlert(result.error);
            })
            .fail(err=>{
                customAlert(err.responseText);
            });
    });
});
const customAlert = (body, disappear = 0, bg = "danger", title = "Error") => {
    const container = $('.modal-body');
    let prettyBody = "<ul>";
    const alertModal = $('.modal');
    $('.modal-header').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('#modalClose').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('.modal-title').text(title);
    if(typeof body !== "object") body = [body];
    body.forEach(error => prettyBody += `<li>${error}</li>`);
    container.html(prettyBody+"</ul>");
    alertModal.modal('show');
    if(disappear) setTimeout(()=>alertModal.modal('hide'), disappear);
}