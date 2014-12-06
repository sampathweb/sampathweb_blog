from conf import *
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import yaml
import os
import hashlib

from fabric.api import local
from fabric.contrib.console import confirm

def test():
    access_key, access_key_secret = load_s3_creds()
    conn = S3Connection(access_key, access_key_secret)
    conn.get_all_buckets()

def load_config():
    try:
        stream = open('s3.yaml', 'r')
    except:
        raise Exception('Credential file "creds.yaml" not found or unable to open')
    return yaml.load(stream)

def load_s3_creds():
    config = load_config()
    try:
        access_key        = config['creds']['access_key']
        access_key_secret = config['creds']['access_key_secret']
    except:
        raise Exception('Credentials not found in creds.yaml!')
    return access_key, access_key_secret

def build():
    local('nikola build')

def deploy():
    build()
    s3_sync()

def compress():
    ''' this job is a hack until nikola gzip job can be fixed '''
    local('find output -type f -name "*\.gz" -delete')
    local('for file in `find output -type f \( -name "*\.js" -o -name "*\.css" -o -name "*\.html" \)`; do gzip -c $file > $file.gz ; done')

def s3_sync():
    access_key, access_key_secret = load_s3_creds()
    conn = S3Connection(access_key, access_key_secret)
    bucket = load_config()['bucket']
    b = conn.get_bucket(bucket)
    remote_files = {}
    print('Getting list of files from S3..\n')
    for key in b.list():
        remote_files[key.name] = key.etag.replace('"', '')

    local_files = {}
    print('Getting list of files locally..\n')
    for parent, dirs, files in os.walk('output'):
        for f in files:
            path = parent + '/' + f
            local_files[path.replace('output/', '')] = hashlib.md5(open(path).read()).hexdigest()

    # files exist on S3, but are not in local
    to_delete = set(remote_files.keys()) - set(local_files.keys())
    if to_delete:
        for f in to_delete:
            print f
        if confirm('These previous files exist on S3, but not locally. Confirm delete on S3?'):
            for f in to_delete:
                print 'Deleting %s..' % f
                b.delete_key(f)
        print '\n'

    to_upload = list(set(local_files.keys()) - set(remote_files.keys()))
    for key, md5 in remote_files.iteritems():
        if key in local_files and md5 != local_files[key]:
            to_upload.append(key)
    for f in to_upload:
        print 'Uploading %s' % f
        k = Key(b)
        k.key = f
        k.set_contents_from_filename('output/' + f)
        b.set_acl('public-read', k.key)
