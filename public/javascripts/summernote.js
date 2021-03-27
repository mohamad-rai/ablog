$(function(){
    $('#saveArticle').on('click', ()=>{

    })
    $('#photo').on('change', function(){
        if($(this).val()){
            $('#photoLabel').hide();
            $('#clearPhoto').show();
        }
    });
    $('#clearPhoto').on('click', ()=>{
        $('#photo').val(null);
        $('#clearPhoto').hide();
        $('#photoLabel').show();
    });

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
})