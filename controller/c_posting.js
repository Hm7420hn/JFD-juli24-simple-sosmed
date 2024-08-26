const m_post   = require('./../model/m_post')
const path     = require('path') 
const moment   = require('moment')
moment.locale('id')

module.exports =
{
    index: function(req,res) {
        let dataview = {
            req: req,
            moment: moment,
            message: req.session.msg,
        }
        res.render('posting/index', dataview)
    },


    proses_insert: async function(req,res){
        let caption = req.body.form_caption
        let media1  = req.files.form_media1
        let media2  = req.files.form_media2
        let media3  = req.files.form_media3


        if (caption || (media1 || media2 || media3) ) {
            try {
                
                let max_size= 1024 * 1024 * 3 //3MB
                
                // cek ukuran media
                if (media1.size > max_size) {
                    return res.redirect(`/posting?msg-Media 1 exceeds size melebihi limit 3MB`)    

                } else if (media2.size > max_size) {
                    return res.redirect(`/posting?msg-Media 1 exceeds size melebihi limit 3MB`)    
        
                } else if (media3.size > max_size) {
                    return res.redirect(`/posting?msg-Media 1 exceeds size melebihi limit 3MB`)    

                } else {
                    // ganti nama file asli 
                    let username      = req.session.user[0].username.replaceAll('.','-') 
                    let datetime      = moment().format('YYYMMDD_HHHmmss')
                    
                    let file1_name     = username + '_' + datetime + '_' + media1.name
                    let file2_name     = username + '_' + datetime + '_' + media2.name
                    let file3_name     = username + '_' + datetime + '_' + media3.name

                    let folder1_simpan = path.join(__dirname, '../public/feed/', file1_name)
                    let folder2_simpan = path.join(__dirname, '../public/feed/', file2_name)
                    let folder3_simpan = path.join(__dirname, '../public/feed/', file3_name)

                    let pesan_upload   = ''
                    media1.mv(folder1_simpan, async function(err) {
                        if (err) {
                            pesan_upload += `<br> Media 1 gagal berhasil upload `
                        } else {
                            pesan_upload += `<br> Media 1 berhasil upload `
                        }
                    })

                    media2.mv(folder2_simpan, async function(err) {
                        if (err) {
                            pesan_upload += `<br> Media 2 gagal berhasil upload `
                        } else {
                            pesan_upload += `<br> Media 2 berhasil upload `
                        }
                    })

                    media3.mv(folder3_simpan, async function(err) {
                        if (err) {
                            pesan_upload += `<br> Media 3 gagal berhasil upload `
                        } else {
                            pesan_upload += `<br> Media 3 berhasil upload `
                        } 
                    })

                
        

                    // proses insert ke database
                    let insert = await m_post.insert(req)
                    if (insert.affectedRows > 0) {
                        return res.redirect(`/feed?msg-berhasil kirim postingan${pesan_upload}`)
                    }
                    
                }    
            } catch (error) {
                // menangkap error dari proses try (insert ke db)
                console.log(error);
                res.redirect(`/posting?msg=${error}`)
            }
        } else {
            // kirim pesan error/warning
            // terhadap pengecekan antara caption atau media, salah satunya harus terisi
            let pesan_error = 'Caption atau Media harus terisi salah satu'
            res.redirect(`/posting?msg=${pesan_error}`)
        }
    },
}