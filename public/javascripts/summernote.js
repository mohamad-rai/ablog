$(function () {
    $('#saveArticle').on('click', () => {
        const data = {
            title: $('#title').val(),
            content: $('.summernote').summernote('code')
        }
        $.ajax({
            url: "/api/article/create",
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
                    $('.summernote').summernote('reset');
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
                    if (result.result) {
                        customAlert(["مقاله با موفقیت منتشر شد."], 2000, "success", "Update");
                        $('#title').val(null);
                        $('.summernote').summernote('reset');
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
    })
    $('#photo').on('change', function () {
        if ($(this).val()) {
            $('#photoLabel').hide();
            $('#clearPhoto').show();
        }
    });
    $('#clearPhoto').on('click', clearPhoto);

    $('.summernote').summernote({
        placeholder: "متن خودتون رو اینجا بنویسید...",
        height: 350,
        minHeight: null,
        maxHeight: null,
        focus: true,
        lang: "fa-IR"
    });

    $('.inline-editor').summernote({
        airMode: true
    });

    $('.airmode-summer').summernote({
        airMode: true
    });
});
const clearPhoto = () => {
    $('#photo').val(null);
    $('#clearPhoto').hide();
    $('#photoLabel').show();
}
const customAlert = (body, disappear = 0, bg = "danger", title = "Error") => {
    const container = $('.modal-body');
    let prettyBody = "<ul>";
    const alertModal = $('.modal');
    $('.modal-header').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('#modalClose').removeClass('bg-danger bg-success').addClass(`bg-${bg}`);
    $('.modal-title').text(title);
    if (typeof body !== "object") body = [body];
    body.forEach(error => prettyBody += `<li>${error}</li>`);
    container.html(prettyBody + "</ul>");
    alertModal.modal('show');
    if (disappear) setTimeout(() => alertModal.modal('hide'), disappear);
}