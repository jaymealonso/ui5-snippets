# Procedure for adding multiple GitHub accounts

The procedure outlines how to configure a system to work with multiple GitHub accounts by generating separate SSH keys for each account, adding the corresponding public keys to the respective GitHub accounts, creating a configuration file in the `.ssh` directory to associate specific hostnames with each identity file, setting up individual `.gitconfig` files for different working directories (e.g., personal and work) to manage user-specific settings like name and email, adding the generated SSH keys to the SSH agent, verifying the configuration by testing the connection to GitHub using the defined hostnames, and finally, emphasizing the importance of using the custom hostnames in the remote repository URL when cloning or interacting with repositories to ensure the correct account is used.

## Follow below steps to add multiple accounts -

### Step 1:

Go to .ssh folder and generate ssh keys for all your github accounts

```bash
$ cd ~/.ssh
$ ssh-keygen -t rsa -b 4096 -C "personal_email_id"
 # save as id_rsa_personal
$ ssh-keygen -t rsa -b 4096 -C "work_email_id"
 # save as id_rsa_work
```

### Step 2:

Copy `id_rsa_personal.pub` and `id_rsa_work.pub` and add to respective github account.

### Step 3:

Create config file in .ssh folder and add below configs

```bash
$ touch config
```

```
# Personal account - default config
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_personal
# Work account
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_work
```

### Step 4:

Create .gitconfig for personal and work directory with respective config git host names

```bash
$ cd ~

$ nano ~/.gitconfig
```

```
[user]
   name = personal_name
   email = personal_email_id
[includeIf "gitdir:~/work/"]
   path = ~/work/.gitconfig
```

```bash
$ nano ~/work/.gitconfig
```

```
[user]
   name = Coder Train
   email = work_email_id
```

### Step 5:

Add new ssh keys

```bash
$ cd ~/.ssh

$ ssh-add id_rsa_personal
$ ssh-add id_rsa_work

$ ssh-add -l
```

### Step 6:

Check configuration is right by pinging to github with below commands

```bash
$ ssh -T github.com-personal
$ ssh -T github.com-work
```

### Step 7:

Always clone repo by adding hostname in remote url
e.g. git@github.com to git@github.com-personal

```
git clone git@github.com-personal:sagarjunnarkar/sagarjunnarkar.github.io.git
git@github.com-work:coder-train/multiple-git-accounts-demo.git
```