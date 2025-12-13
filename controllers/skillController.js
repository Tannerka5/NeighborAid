exports.listSkills = (req, res) => {
    res.render('skills/list', {
        user: { firstName: 'Demo' },
        skills: [],
        currentPage: 'skills'
    });
};

exports.showAddSkill = (req, res) => {
    res.render('skills/form', {
        user: { firstName: 'Demo' },
        isEdit: false,
        skill: null
    });
};

exports.addSkill = (req, res) => {
    res.redirect('/skills');
};

exports.showEditSkill = (req, res) => {
    res.render('skills/form', {
        user: { firstName: 'Demo' },
        isEdit: true,
        skill: { id: req.params.id }
    });
};

exports.updateSkill = (req, res) => {
    res.redirect('/skills');
};

exports.deleteSkill = (req, res) => {
    res.redirect('/skills');
};