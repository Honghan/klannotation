(function($){
    let _curDoc = null;
    function getAllDocIds(){
        qbb.inf.getDocList(function (docs){
            let s = "";
            for(let i=0; i<docs.length;i++){
                s += "<a id='" + docs[i].replaceAll(".", "_") + "' docId='" + docs[i] + "'>" + docs[i] + "</a>";
                if (i == 0){
                    _curDoc = docs[i];
                }
            }
            $('.docList').html(s);
            $('.docList a').click(function (){
                getDocDetail($(this).attr('docId'));
            });
            getDocDetail(_curDoc);
        });
    }

    function getDocDetail(docId){
        $('.selected').removeClass('selected');
        $('.docContent').html('loading ' + docId + '...')
        _curDoc = docId;
        $('#' + _curDoc.replaceAll(".", "_")).addClass('selected');
        qbb.inf.getDocDetail(_curDoc, function (ss){
            $('.docContent').html(highlight(ss["anns"], ss["content"], false))
            $('mark').mouseover(function (){
                $('.ann').hide();
                $(this).find('.ann').each(function (){
                    let ppos = $(this).parent().position();
                    $(this).css("left", ppos.left);
                    $(this).css("top", ppos.top - 36);
                    $(this).show();
                });

            });
            $('mark').mouseout(function (){
                $(this).find('.ann').hide();
            })
        })
    }

    function formatAnnotation(ann){
        return {
            "term": "",
            "s": ann['start'],
            "e": ann['end'],
            "t": ann.sty,
            "label": ann.pref,
            "negation": ann.negation,
            "experiencer": ann.experiencer,
            "temporality": ann.temporality,
            "hypothetical": ann.temporality === "hypothetical"
        }
    }

    function highlight(ann_ret, text, snippet) {
        let idx;
        let hos = [];
            let anns = ann_ret['annotations']
        for (idx in anns){
            hos.push(formatAnnotation(anns[idx]));
        }
        hos = hos.sort(function(a, b){
            return a["s"] - b["s"];
        });

        const moreTextLen = 20;
        let new_str = "";
        if (hos.length > 0){
            let prev_pos = snippet ? (hos[0]['s'] > moreTextLen ? hos[0]['s'] - moreTextLen : hos[0]['s']) : 0;
            if (prev_pos > 0)
                new_str += "...";
            for (let idx in hos){
                const ann = hos[idx];
                new_str += text.substring(prev_pos, ann["s"]) +
                    "<mark class='" + ann.negation + "'><span title='" +
                    ann["t"] + "' class=\"ann\">" + ann["label"] + " | " +
                    ann["t"] + "</span>" + text.substring(ann["s"], ann["e"]) + "</mark>";
                prev_pos = ann["e"];
                if (snippet)
                    break;
            }
            const endPos = snippet ? Math.min(parseInt(prev_pos) + moreTextLen, text.length) : text.length;
            new_str += text.substring(prev_pos, endPos);
            if (endPos < text.length)
                new_str += "...";
        }else{
            new_str = snippet ? text.substring(0, Math.min(text.length, moreTextLen)) + "...": text;
        }
        return new_str;
    }

    $(document).ready(function(){
        getAllDocIds();
    })

})(this.jQuery)
